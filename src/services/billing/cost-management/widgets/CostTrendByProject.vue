<template>
    <cost-dashboard-card-widget-layout title="Cost Trend by Project" :widget-link="widgetLink" class="cost-trend-by-project">
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
                                       :currency-rates="currencyRates"
                                       :currency="currency"
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

import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { Period } from '@/services/billing/cost-management/type';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { gray } from '@/styles/colors';
import config from '@/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import { ChartData, Legend, WidgetProps } from '@/services/billing/cost-management/widgets/type';
import {
    getCurrencyAppliedChartData, getTableDataFromRawData, getXYChartDataAndLegends,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';


interface TableItem {
    project: string;
    [key: string]: string | number;
}

interface Props extends WidgetProps {
    groupBy: string;
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
        groupBy: {
            type: String,
            default: undefined,
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const state = reactive({
            _top15itemNames: [],
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    chartType: primitiveToQueryString(CHART_TYPE.STACKED_COLUMN),
                    granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                    groupBy: arrayToQueryString([GROUP_BY.PROJECT]),
                    period: objectToQueryString(props.period),
                    filters: objectToQueryString(props.filters),
                },
            })),
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
                const fields: DataTableField[] = [{ name: GROUP_BY.PROJECT, label: 'Project' }];
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
        const _getApiPeriod = (period: Period): Period => ({
            start: dayjs(period.end).subtract(5, 'month').format('YYYY-MM'),
            end: dayjs.utc(period.end).add(1, 'month').startOf('month').format('YYYY-MM-DD'),
        });

        /* api */
        const costQueryHelper = new QueryHelper();
        const getCostTableData = async (period, filters) => {
            costQueryHelper.setFilters(getConvertedFilter(filters));
            try {
                state.tableLoading = true;
                const apiPeriod = _getApiPeriod(period);
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY.PROJECT],
                    start: apiPeriod.start,
                    end: apiPeriod.end,
                    pivot_type: 'TABLE',
                    page: {
                        limit: 15,
                    },
                    ...costQueryHelper.apiQuery,
                });
                state.totalCount = total_count > 15 ? 15 : total_count;
                state.items = getTableDataFromRawData(results, [GROUP_BY.PROJECT]) as TableItem[];
                state._top15itemNames = results.map(d => d.project_id);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.tableLoading = false;
            }
        };
        const getCostChartData = async (top15itemNames, period, filters) => {
            costQueryHelper.setFilters([
                ...getConvertedFilter(filters),
                {
                    k: props.groupBy,
                    v: top15itemNames,
                    o: '=',
                },
            ]);
            try {
                state.chartLoading = true;
                const apiPeriod = _getApiPeriod(period);
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY.PROJECT],
                    start: apiPeriod.start,
                    end: apiPeriod.end,
                    pivot_type: 'CHART',
                    ...costQueryHelper.apiQuery,
                });
                const { chartData, legends } = getXYChartDataAndLegends(results, GROUP_BY.PROJECT);
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
        watch([() => props.period, () => props.filters], ([period, filters]) => {
            getCostChartData(state._top15itemNames, period, filters);
            getCostTableData(period, filters);
        }, { immediate: true });

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
