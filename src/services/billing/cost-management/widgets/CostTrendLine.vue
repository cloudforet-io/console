<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_TREND_BY_PROJECT')" :widget-link="widgetLink" class="cost-trend-by-project"
                                       :print-mode="printMode"
    >
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="loading"
                                       :this-page.sync="thisPage"
                                       :page-size="PAGE_SIZE"
                                       :chart="chart"
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
import dayjs from 'dayjs';
import { range } from 'lodash';
import * as am4charts from '@amcharts/amcharts4/charts';
import { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PChartLoader, PSkeleton } from '@spaceone/design-system';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';

import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { gray } from '@/styles/colors';
import config from '@/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import {
    ChartData, CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/billing/cost-management/widgets/type';
import {
    getCurrencyAppliedChartData,
    getLegends, getTooltipText,
    getXYChartData,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { Period } from '@/services/billing/cost-management/type';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { store } from '@/store';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';
import { toggleSeries } from '@/lib/amcharts/helper';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';


interface TableItem {
    project_id: string;
    [key: string]: string | number;
}

interface Props extends WidgetProps {
    groupBy: string;
}

const PAGE_SIZE = 5;

const CATEGORY_KEY = 'date';

export default {
    name: 'CostTrendLine',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PChartLoader,
        PSkeleton,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                const _period = {
                    start: dayjs(props.period.end).subtract(5, 'month').format('YYYY-MM'),
                    end: dayjs.utc(props.period.end).format('YYYY-MM'),
                };
                return {
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                        groupBy: arrayToQueryString([GROUP_BY.PROJECT]),
                        period: objectToQueryString(_period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
            projects: computed(() => store.state.resource.project.items),
            //
            chartRegistry: {},
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            chartData: [] as ChartData[],
            legends: [] as Legend[],
            //
            loading: true,
            items: [] as CostAnalyzeModel[],
            fields: computed<DataTableField[]>(() => {
                const fields: DataTableField[] = [{ name: GROUP_BY.PROJECT, label: 'Project' }];
                const fiveMonthsAgo = dayjs.utc(props.period.end).subtract(5, 'month');
                const thisMonth = dayjs.utc();
                range(6).forEach((d) => {
                    const date = fiveMonthsAgo.add(d, 'month');
                    fields.push({
                        name: `usd_cost.${date.format('YYYY-MM')}`,
                        label: thisMonth.isSame(date, 'month') ? `${date.format('MMM')} (MTD)` : date.format('MMM'),
                    });
                });
                return fields;
            }),
            totalCount: 15,
            thisPage: 1,
        });

        /* util */
        const getSlicedChartDataAndLegends = () => {
            const slicedItems = state.items.slice((state.thisPage * 5) - 5, state.thisPage * 5);
            const _period = {
                start: dayjs(props.period.end).subtract(5, 'month').format('YYYY-MM'),
                end: dayjs.utc(props.period.end).format('YYYY-MM'),
            };
            const slicedChartData = getXYChartData(slicedItems, GRANULARITY.MONTHLY, _period, GROUP_BY.PROJECT);
            const slicedLegends = state.legends.slice((state.thisPage * 5) - 5, state.thisPage * 5);
            return { slicedChartData, slicedLegends };
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
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
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
                const projectId = legend.name;
                const seriesColor = DEFAULT_CHART_COLORS[(state.thisPage * 5 - 5) + idx];
                const series = chart.series.push(new am4charts.LineSeries());
                if (props.printMode) series.showOnInit = false;
                series.name = legend.label;
                series.dataFields.dateX = CATEGORY_KEY;
                series.dataFields.valueY = projectId;
                series.stroke = am4core.color(seriesColor);
                series.strokeWidth = 2;
                series.tooltip.label.fontSize = 14;
                series.tooltip.getFillFromObject = false;
                series.tooltip.background.fill = am4core.color(seriesColor);

                series.adapter.add('tooltipText', (tooltipText, target) => {
                    if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                        const usdCost = target.tooltipDataItem.dataContext[projectId] ? Number(target.tooltipDataItem.dataContext[projectId]) : undefined;
                        const currencyMoney = currencyMoneyFormatter(usdCost, props.currency, undefined, true);
                        return getTooltipText('name', undefined, currencyMoney);
                    }
                    return tooltipText;
                });

                const bullet = series.bullets.push(new am4charts.CircleBullet());
                bullet.fill = am4core.color(seriesColor);
                bullet.circle.radius = 3.5;
            };

            legends.forEach((legend, idx) => {
                createSeries(legend, idx);
            });

            chart.cursor = new am4charts.XYCursor();
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
                    group_by: [GROUP_BY.PROJECT],
                    start: dayjs.utc(period.end).subtract(5, 'month').format('YYYY-MM'),
                    end: dayjs.utc(period.end).format('YYYY-MM'),
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
                state.legends = getLegends(results, GROUP_BY.PROJECT);
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
.cost-trend-by-project {
    .chart-wrapper {
        height: 10rem;
        .chart {
            height: 100%;
        }
    }
    .table-wrapper::v-deep {
        padding-top: 1rem;

        .cost-dashboard-data-table {
            .p-data-table {
                height: 13.5rem;
            }
        }
    }
}
</style>
