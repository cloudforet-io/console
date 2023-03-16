<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_TREND_BY_PROJECT')"
                                       class="cost-trend-line"
                                       :widget-link="widgetLink"
                                       :print-mode="printMode"
    >
        <p-data-loader :loading="loading"
                       class="chart-wrapper"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef"
                 class="chart"
            />
        </p-data-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="loading"
                                       :this-page.sync="thisPage"
                                       :page-size="PAGE_SIZE"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :pagination-visible="!printMode"
                                       :print-mode="printMode"
                                       show-legend
                                       @toggle-legend="handleToggleLegend"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import type { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY } from '@/store/modules/display/config';

import { toggleSeries } from '@/lib/amcharts/helper';
import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Period } from '@/services/cost-explorer/type';
import {
    getCurrencyAppliedChartData,
    getLegends,
    getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type {
    ChartData, CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

const PAGE_SIZE = 5;
const CATEGORY_KEY = 'date';

export default {
    name: 'CostTrendLine',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PDataLoader,
        PSkeleton,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object as () => WidgetOptions,
            default: () => ({}),
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps, { emit }) {
        const state = reactive({
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                const _period = {
                    start: dayjs.utc(props.period.end).subtract(5, 'month').format('YYYY-MM-01'),
                    end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
                };
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                        group_by: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(_period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
            //
            chartRegistry: {},
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            chartData: [] as ChartData[],
            legends: [] as Legend[],
            //
            loading: true,
            groupBy: computed(() => props.options?.group_by),
            items: [] as CostAnalyzeModel[],
            fields: computed<DataTableField[]>(() => {
                const fields: DataTableField[] = [GROUP_BY_ITEM_MAP[state.groupBy]];
                const fiveMonthsAgo = dayjs.utc(props.period.end).subtract(5, 'month');
                const thisMonth = dayjs.utc();
                range(6).forEach((d) => {
                    const date = fiveMonthsAgo.add(d, 'month');
                    fields.push({
                        name: `usd_cost.${date.format('YYYY-MM')}`,
                        label: thisMonth.isSame(date, 'month') ? `${date.format('MMM')} (MTD)` : date.format('MMM'),
                        textAlign: 'right',
                    });
                });
                return fields;
            }),
            totalCount: 15,
            thisPage: 1,
        });

        /* util */
        const getSlicedChartDataAndLegends = async () => {
            try {
                const slicedItems = state.items.slice((state.thisPage * 5) - 5, state.thisPage * 5);
                const _period = {
                    start: dayjs.utc(props.period.end).subtract(5, 'month').format('YYYY-MM'),
                    end: dayjs.utc(props.period.end).format('YYYY-MM'),
                };
                const slicedChartData = getXYChartData(slicedItems, GRANULARITY.MONTHLY, _period, state.groupBy);
                const slicedLegends = state.legends.slice((state.thisPage * 5) - 5, state.thisPage * 5);
                return { slicedChartData, slicedLegends };
            } catch (e) {
                ErrorHandler.handleError(e);
                return ({ slicedChartData: [], slicedLegends: [] });
            }
        };
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
            chart.events.on('ready', () => {
                emit('rendered');
            });
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
            dateAxis.dataFields.category = CATEGORY_KEY;
            dateAxis.renderer.minGridDistance = 30;
            dateAxis.fontSize = 12;
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.grid.template.strokeOpacity = 1;
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.startLocation = 0.45;
            dateAxis.endLocation = 0.55;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.renderer.grid.template.strokeOpacity = 0;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.01;
            valueAxis.renderer.minGridDistance = 30;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem) {
                    if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
                }
                return text;
            });

            const createSeries = (legend, idx) => {
                const seriesColor = DEFAULT_CHART_COLORS[(state.thisPage * 5 - 5) + idx];
                const series = chart.series.push(new am4charts.LineSeries());
                if (props.printMode) series.showOnInit = false;
                series.name = legend.label;
                series.dataFields.dateX = CATEGORY_KEY;
                series.dataFields.valueY = legend.name;
                series.stroke = am4core.color(seriesColor);
                series.strokeWidth = 2;
                series.tooltip.label.fontSize = 14;
                series.tooltip.getFillFromObject = false;
                series.tooltip.background.fill = am4core.color(seriesColor);

                series.tooltip.getFillFromObject = false;
                series.tooltip.background.fill = am4core.color('white');
                series.tooltip.label.fill = am4core.color('black');
                series.tooltip.defaultState.transitionDuration = 0;
                series.tooltip.hiddenState.transitionDuration = 0;
                series.adapter.add('tooltipText', (tooltipText, target) => {
                    const dateText = dayjs.utc(target.tooltipDataItem.dataContext.date).format('MMM');
                    let text = `${dateText}\n`;
                    chart.series.each((item) => {
                        if (!item.isHidden) {
                            const cost = Number(target.tooltipDataItem.dataContext[item.dataFields.valueY] ?? 0);
                            const currencyMoney = currencyMoneyFormatter(cost, props.currency, undefined, true);
                            text += `[${item.stroke.hex}]●[/] ${item.name}: [bold]${currencyMoney}[/]\n`;
                        }
                    });
                    return text;
                });

                if (legend.name !== 'dummy') {
                    const bullet = series.bullets.push(new am4charts.CircleBullet());
                    bullet.fill = am4core.color(seriesColor);
                    bullet.circle.radius = 3.5;
                }
            };

            if (legends.length) {
                legends.forEach((legend, idx) => {
                    createSeries(legend, idx);
                });
            } else {
                const dummyChartData = [...chartData];
                dummyChartData[0].dummy = 0;
                chart.data = dummyChartData;
                valueAxis.min = 0;
                valueAxis.extraMax = 100;
                createSeries({ name: 'dummy', label: 'dummy' }, 0);
            }

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.maxTooltipDistance = 0;
            chart.cursor.lineX.disabled = true;
            chart.cursor.lineY.disabled = true;
            chart.cursor.behavior = 'none';

            return chart;
        };

        /* api */
        const costQueryHelper = new QueryHelper();
        const listCostAnalysisData = async (period: Period, filters): Promise<CostAnalyzeModel[]> => {
            costQueryHelper.setFilters(getConvertedFilter(filters));
            try {
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [state.groupBy],
                    start: dayjs.utc(period.end).subtract(5, 'month').format('YYYY-MM'),
                    end: dayjs.utc(period.end).format('YYYY-MM'),
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
                state.legends = getLegends(results, GRANULARITY.MONTHLY, state.groupBy);
                state.totalCount = total_count > 15 ? 15 : total_count;
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        /* event */
        const handleToggleLegend = (index) => {
            const convertedIndex = index + ((state.thisPage - 1) * PAGE_SIZE);
            toggleSeries(state.chart as XYChart | PieChart | TreeMap, index);
            state.legends[convertedIndex].disabled = !state.legends[convertedIndex]?.disabled;
        };

        watch(() => props.currency, (currency) => {
            if (state.chart) {
                state.chart.data = getCurrencyAppliedChartData(state.chartData, currency, props.currencyRates);
            }
        });
        watch([() => props.period, () => props.filters], async ([period, filters]) => {
            state.loading = true;
            state.items = await listCostAnalysisData(period, filters);
            if (state.items.length === 0) emit('rendered');
            const { slicedChartData, slicedLegends } = await getSlicedChartDataAndLegends();
            state.chartData = slicedChartData;
            state.chart = drawChart(state.chartRef, slicedChartData, slicedLegends);
            state.loading = false;
        }, { immediate: true });
        watch(() => state.thisPage, async () => {
            const { slicedChartData, slicedLegends } = await getSlicedChartDataAndLegends();
            state.chartData = slicedChartData;
            state.chart = drawChart(state.chartRef, slicedChartData, slicedLegends);
            state.legends.forEach((d, idx) => {
                state.legends[idx].disabled = false;
            });
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            PAGE_SIZE,
            handleToggleLegend,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-trend-line {
    .chart-wrapper {
        height: 13rem;
        .chart {
            height: 100%;
        }
    }
    .table-wrapper {
        padding-top: 1rem;

        /* custom /* custom design-system component - p-card */
        :deep(.cost-dashboard-data-table) {
            .p-data-table {
                min-height: 13.5rem;
            }
        }
    }
}
</style>
