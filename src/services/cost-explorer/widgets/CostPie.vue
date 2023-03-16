<template>
    <cost-dashboard-card-widget-layout class="spc-project-wise-usage-summary"
                                       :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.SPC_USAGE_SUMMARY')"
                                       :widget-link="widgetLink"
                                       :data-range="20"
                                       :print-mode="printMode"
    >
        <p-data-loader :loading="loading"
                       :disalbe-transition="printMode"
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
            <cost-dashboard-data-table :fields="tableState.fields"
                                       :items="tableState.items"
                                       :loading="loading"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :page-size="PAGE_SIZE"
                                       :pagination-visible="false"
                                       show-legend
                                       class="table table-left"
                                       @toggle-legend="handleToggleLegend1"
            />
            <cost-dashboard-data-table v-if="tableState.items.length > PAGE_SIZE"
                                       :fields="tableState.fields"
                                       :items="tableState.items"
                                       :loading="loading"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :page-size="PAGE_SIZE"
                                       :this-page="2"
                                       :pagination-visible="false"
                                       show-legend
                                       class="table table-right"
                                       @toggle-legend="handleToggleLegend2"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import type { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { PSkeleton, PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/modules/display/config';

import { toggleSeries } from '@/lib/amcharts/helper';
import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { CHART_TYPE } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import {
    getLegends,
    getPieChartData, getTooltipText,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type { Legend, PieChartData, WidgetProps } from '@/services/cost-explorer/widgets/type';

const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';

const PAGE_SIZE = 10;

export default defineComponent<WidgetProps>({
    name: 'CostPie',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PSkeleton,
        PDataLoader,
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
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps, { emit }) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as PieChart | null,
            chartRegistry: {},
            loading: true,
            chartData: [] as PieChartData[],
            legends: [] as Legend[],
            groupBy: computed(() => props.options?.group_by),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        chartType: primitiveToQueryString(CHART_TYPE.DONUT),
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        group_by: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
        });
        const tableState = reactive({
            items: [],
            fields: computed(() => [
                GROUP_BY_ITEM_MAP[state.groupBy],
                { name: 'usd_cost', label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.FIELD_LABEL.ACCUMULATED_SPENT'), textAlign: 'right' },
            ]),
            totalCount: 20,
        });

        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                state.chartRegistry[chartContext] = undefined;
            }
        };

        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.PieChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();

            chart.events.on('ready', () => {
                emit('rendered');
            });

            chart.paddingTop = 5;
            chart.paddingBottom = 5;
            chart.radius = am4core.percent(100);

            const series = chart.series.push(new am4charts.PieSeries());
            if (props.printMode) series.showOnInit = false;
            series.dataFields.value = VALUE_KEY;
            series.dataFields.category = CATEGORY_KEY;
            series.labels.template.disabled = true;
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.slices.template.adapter.add('tooltipText', (tooltipText, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const currencyMoney = currencyMoneyFormatter(target.dataItem.value, props.currency, props.currencyRates, true);
                    return getTooltipText(CATEGORY_KEY, VALUE_KEY, currencyMoney, false);
                }
                return tooltipText;
            });
            series.tooltip.label.fontSize = 14;

            if (state.chartData.length === 0) {
                series.tooltip.disabled = true;
                chart.data = [{
                    category: 'No Data',
                    value: 1,
                    color: am4core.color(gray[100]),
                }];
            } else {
                chart.data = state.chartData;
            }
            return chart;
        };

        const costQueryHelper = new QueryHelper();
        const fetchData = async () => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                include_usage_quantity: false,
                granularity: GRANULARITY.ACCUMULATED,
                group_by: [state.groupBy],
                start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                limit: 20,
                ...costQueryHelper.apiQuery,
            });
            return results;
        };

        const getData = async () => {
            try {
                state.loading = true;

                const results = await fetchData();

                tableState.items = results;
                state.chartData = getPieChartData(results, state.groupBy);
                state.legends = getLegends(results, GRANULARITY.ACCUMULATED, state.groupBy);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.chartData = [];
            } finally {
                state.loading = false;
            }
        };

        const handleToggleLegend1 = (index) => {
            toggleSeries(state.chart as XYChart | PieChart | TreeMap, index);
            state.legends[index].disabled = !state.legends[index]?.disabled;
        };
        const handleToggleLegend2 = (index) => {
            const convertedIndex = index + PAGE_SIZE;
            toggleSeries(state.chart as XYChart | PieChart | TreeMap, convertedIndex);
            state.legends[convertedIndex].disabled = !state.legends[convertedIndex]?.disabled;
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                state.chart = drawChart(chartContext);
            }
        }, { immediate: false });

        watch([() => props.period, () => props.filters], async () => {
            await getData();
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            tableState,
            PAGE_SIZE,
            handleToggleLegend1,
            handleToggleLegend2,
        };
    },
});
</script>

<style lang="postcss" scoped>
.chart-wrapper {
    height: 15rem;
}
.chart {
    width: 100%;
    height: 100%;
}
.table-wrapper {
    @apply flex;
    flex-wrap: wrap;
    .table {
        flex: 1 1 40%;
    }
}

@screen tablet {
    .table-right {
        @apply border-t border-gray-200;

        /* custom cost-dashboard-data-table */

        /* custom design-system component - p-data-table */
        :deep(.p-data-table) th {
            display: none;
        }
    }
}
</style>
