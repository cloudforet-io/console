<template>
    <cost-dashboard-card-widget-layout title="Cost Trend by Project" class="cost-trend-by-project">
        <p-chart-loader :loading="chartLoading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="tableLoading"
                                       :this-page.sync="thisPage"
                                       :page-size="5"
                                       :chart="chart"
                                       :legends="legends"
                                       show-legend
                                       @toggle-legend="handleToggleLegend"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { range } from 'lodash';
import { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import {
    computed, reactive, toRefs, watch, onUnmounted,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable
    from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';

import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { FILTER_ITEM, GRANULARITY, GROUP_BY_ITEM } from '@/services/billing/cost-management/lib/config';
import { FilterItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { Legend } from '@/services/billing/cost-management/widgets/composables/dynamic-chart/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { gray } from '@/styles/colors';
import config from '@/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import { ChartData, WidgetProps } from '@/services/billing/cost-management/widgets/type';
import {
    getCurrencyAppliedChartData, getTableDataFromRawData,
    getXYChartDataAndLegends,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';


interface TableItem {
    project: string;
    [key: string]: string | number;
}

export default {
    name: 'CostTrendByProject',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PChartLoader,
        PSkeleton,
    },
    props: {
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: WidgetProps) {
        const state = reactive({
            filters: {} as Record<FILTER_ITEM, FilterItem[]>,
            top15ProjectIds: [],
            //
            chartLoading: true,
            chartRegistry: {},
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            chartData: [] as ChartData[],
            legends: [] as Legend[],
            //
            tableLoading: true,
            items: [] as TableItem[],
            fields: computed<DataTableField[]>(() => {
                const fields = [{ name: GROUP_BY_ITEM.PROJECT, label: 'Project' }];
                const fiveMonthsAgo = dayjs.utc().subtract(5, 'month');
                range(6).forEach((d) => {
                    const date = fiveMonthsAgo.add(d, 'month');
                    fields.push({ name: date.format('YYYY-MM'), label: date.format('MMM') });
                });
                return fields;
            }),
            totalCount: 15,
            thisPage: 1,
        });

        /* util */
        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
        };
        const drawChart = (chartContext, chartData, legends) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.data = getCurrencyAppliedChartData(chartData, props.currency, props.currencyRates);

            chart.dateFormatter.inputDateFormat = 'yyyy-MM';
            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.baseInterval = {
                timeUnit: 'month',
                count: 1,
            };
            dateAxis.dateFormats.setKey('month', 'MMM');
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 30;
            dateAxis.fontSize = 12;
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.grid.template.strokeOpacity = 1;
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.tooltip.label.fontSize = 12;
            dateAxis.renderer.grid.template.strokeOpacity = 0;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.01;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            valueAxis.tooltip.label.fontSize = 12;
            valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem) {
                    if (target.dataItem.value === 0) return '($USD) 0'; // todo: have to be changed
                    if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
                }
                return text;
            });

            const createSeries = (legend) => {
                const series = chart.series.push(new am4charts.LineSeries());
                series.name = legend.label;
                series.dataFields.dateX = 'date';
                series.dataFields.valueY = legend.name;
                series.tooltipText = '{name}: [bold]{valueY}[/]';
                series.tooltip.label.fontSize = 10;
                return series;
            };

            legends.forEach((legend) => {
                createSeries(legend);
            });

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.maxTooltipDistance = 20;
            chart.cursor.lineX.disabled = true;
            chart.cursor.lineY.disabled = true;

            return chart;
        };

        /* api */
        const costApiQueryHelper = new ApiQueryHelper();
        const getCostTableData = async () => {
            costApiQueryHelper.setFilters(getConvertedFilter(state.filters));
            try {
                state.tableLoading = true;
                const thisMonth = dayjs.utc();
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY_ITEM.PROJECT],
                    start: thisMonth.subtract(5, 'month'),
                    end: thisMonth.format('YYYY-MM'),
                    pivot_type: 'TABLE',
                    page: {
                        limit: 15,
                    },
                    ...costApiQueryHelper.data,
                });
                state.totalCount = total_count > 15 ? 15 : total_count;
                state.items = getTableDataFromRawData(results, [{ name: GROUP_BY_ITEM.PROJECT, label: 'Project' }]) as TableItem[];
                state.top15ProjectIds = results.map(d => d.project_id);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.tableLoading = false;
            }
        };
        const getCostChartData = async (top15ProjectIds) => {
            costApiQueryHelper.setFilters([
                ...getConvertedFilter(state.filters),
                {
                    k: GROUP_BY_ITEM.PROJECT,
                    v: top15ProjectIds,
                    o: '=',
                },
            ]);
            try {
                state.chartLoading = true;
                const thisMonth = dayjs.utc();
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY_ITEM.PROJECT],
                    start: thisMonth.subtract(5, 'month'),
                    end: thisMonth.format('YYYY-MM'),
                    pivot_type: 'CHART',
                    ...costApiQueryHelper.data,
                });
                const { chartData, legends } = getXYChartDataAndLegends(results, GROUP_BY_ITEM.PROJECT);
                state.chartData = chartData;
                state.legends = legends;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.chartLoading = false;
            }
        };

        /* event */
        const handleToggleLegend = (index) => {
            state.legends[index].disabled = !state.legends[index]?.disabled;
        };

        (() => {
            getCostTableData();
        })();

        watch(() => state.top15ProjectIds, (top15ProjectIds) => {
            if (top15ProjectIds.length > 0) {
                getCostChartData(top15ProjectIds);
            }
        });
        watch([() => state.chartLoading, () => state.chartRef], ([chartLoading, chartContext]) => {
            if (!chartLoading && chartContext) {
                state.chart = drawChart(chartContext, state.chartData, state.legends);
            }
        });
        watch(() => props.currency, (currency) => {
            if (state.chart) {
                state.chart.data = getCurrencyAppliedChartData(state.chartData, currency, props.currencyRates);
            }
        });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            handleToggleLegend,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-trend-by-project {
    .chart-wrapper {
        height: 10rem;
        .chart {
            height: 100%;
        }
    }
    .table-wrapper {
        padding-top: 1rem;
    }
}
</style>
