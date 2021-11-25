<template>
    <cost-dashboard-card-widget-layout title="Cost Trend by Product" class="cost-trend-by-product">
        <p-chart-loader :loading="chartLoading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <div class="month-pagination-wrapper">
                <span>Month</span>
                <p-text-pagination :all-page="allMonthPage"
                                   :this-page.sync="thisMonthPage"
                                   :show-page-number="false"
                />
            </div>
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="tableLoading"
                                       :this-page.sync="thisPage"
                                       :page-size="8"
                                       :chart="chart"
                                       :legends="legends"
                                       show-legend
                                       @toggle-legend="handleToggleLegend"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import { range } from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import { XYChart } from '@amcharts/amcharts4/charts';

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton, PTextPagination,
} from '@spaceone/design-system';

import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable
    from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';

import {
    getTableDataFromRawData, getXYChartDataAndLegends,
} from '@/services/billing/cost-management/cost-analysis/lib/converting-data-helper';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import {
    customColorTheme, CUSTOM_COLORS, DISABLED_COLOR,
} from '@/services/billing/cost-management/widgets/composables/dynamic-chart';
import { ChartData, Legend } from '@/services/billing/cost-management/widgets/composables/dynamic-chart/type';
import { FILTER_ITEM, GRANULARITY, GROUP_BY_ITEM } from '@/services/billing/cost-management/lib/config';
import { FilterItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { gray } from '@/styles/colors';
import config from '@/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { getCurrencyAppliedChartData } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';

am4core.useTheme(customColorTheme);
am4core.useTheme(am4themesAnimated);


interface TableItem {
    product: string;
    [key: string]: string | number;
}

export default {
    name: 'CostTrendByProduct',
    components: {
        CostDashboardDataTable,
        CostDashboardCardWidgetLayout,
        PChartLoader,
        PSkeleton,
        PTextPagination,
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
            top15ProductNames: [],
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
                const fields = [{ name: GROUP_BY_ITEM.PRODUCT, label: 'Product' }];
                const fiveMonthsAgo = dayjs.utc().subtract(5, 'month');
                range(state.thisMonthPage * 3 - 3, state.thisMonthPage * 3).forEach((d) => {
                    const date = fiveMonthsAgo.add(d, 'month');
                    fields.push({ name: date.format('YYYY-MM'), label: date.format('MMM') });
                });
                return fields;
            }),
            totalCount: 15,
            thisPage: 1,
            allMonthPage: 2,
            thisMonthPage: 2,
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
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.name = legend.label;
                series.dataFields.dateX = 'date';
                series.dataFields.valueY = legend.name;
                series.strokeWidth = 0;
                series.columns.template.width = am4core.percent(60);
                series.tooltipText = '{name}: [bold]{valueY}[/]';
                series.tooltip.label.fontSize = 10;
                series.stacked = true;
                series.columns.template.propertyFields.fillOpacity = 'fillOpacity';
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
                    group_by: [GROUP_BY_ITEM.PRODUCT],
                    start: thisMonth.subtract(5, 'month'),
                    end: thisMonth.format('YYYY-MM'),
                    pivot_type: 'TABLE',
                    page: {
                        limit: 15,
                    },
                    ...costApiQueryHelper.data,
                });
                state.totalCount = total_count > 15 ? 15 : total_count;
                state.items = getTableDataFromRawData(results, [{ name: GROUP_BY_ITEM.PRODUCT, label: 'Product' }]) as TableItem[];
                state.top15ProductNames = results.map(d => d.product);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.tableLoading = false;
            }
        };
        const getCostChartData = async (top15ProductNames) => {
            costApiQueryHelper.setFilters([
                ...getConvertedFilter(state.filters),
                {
                    k: GROUP_BY_ITEM.PRODUCT,
                    v: top15ProductNames,
                    o: '=',
                },
            ]);
            try {
                state.chartLoading = true;
                const thisMonth = dayjs.utc();
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY_ITEM.PRODUCT],
                    start: thisMonth.subtract(5, 'month'),
                    end: thisMonth.format('YYYY-MM'),
                    pivot_type: 'CHART',
                    ...costApiQueryHelper.data,
                });
                const { chartData, legends } = getXYChartDataAndLegends(results, GROUP_BY_ITEM.PRODUCT);
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

        watch(() => state.top15ProductNames, (top15ProductNames) => {
            if (top15ProductNames.length > 0) {
                getCostChartData(top15ProductNames);
            }
        });
        watch([() => state.chartLoading, () => state.chartRef], ([chartLoading, chartContext]) => {
            if (!chartLoading && chartContext) {
                state.chart = drawChart(chartContext, state.chartData, state.legends);
            }
        }, { immediate: false });
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
            CUSTOM_COLORS,
            DISABLED_COLOR,
            handleToggleLegend,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-trend-by-product::v-deep {
    .card-body {
        @apply grid grid-cols-12;
        .chart-wrapper {
            @apply col-span-6;
            .chart {
                height: 100%;
            }
        }
        .table-wrapper {
            @apply col-span-6;
            .month-pagination-wrapper {
                display: flex;
                align-items: center;
            }
        }
    }
}
</style>
