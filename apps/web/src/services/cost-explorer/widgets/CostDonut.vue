<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_PROVIDER')"
                                       class="cost-donut"
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
            <cost-dashboard-data-table
                :fields="dataTableState.fields"
                :items="chartData"
                :loading="loading"
                :this-page.sync="thisPage"
                :page-size="pageSize"
                :show-legend="false"
                :currency-rates="currencyRates"
                :currency="currency"
                :pagination-visible="!printMode"
                :print-mode="printMode"
                class="table"
            >
                <template #category-format="{value}">
                    {{ value }}
                </template>
            </cost-dashboard-data-table>
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch, onUnmounted, defineComponent,
} from 'vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import type { PieChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY } from '@/store/modules/settings/config';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { getPieChartData, getTooltipText } from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type {
    PieChartData, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';

export default defineComponent<WidgetProps>({
    name: 'CostDonut',
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
            chartRegistry: {},
            loading: false,
            chartData: [] as PieChartData[],
            chart: null as PieChart | null,
            pageSize: 5,
            thisPage: 1,
            groupBy: computed(() => props.options?.group_by),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        group_by: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
        });

        const dataTableState = reactive({
            fields: [
                { name: CATEGORY_KEY, label: GROUP_BY_ITEM_MAP[state.groupBy].label },
                { name: VALUE_KEY, label: 'Cost', textAlign: 'right' },
            ] as DataTableField[],
        });

        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
        };

        const drawChart = (chartContext) => {
            const isChartItemExists = !!state.chartData.length;
            const noItemsChartData: PieChartData[] = [{ category: 'dummy', value: 1, color: gray[100] }];
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.PieChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (isChartItemExists) {
                chart.data = state.chartData;
            } else {
                chart.data = noItemsChartData;
            }

            chart.innerRadius = am4core.percent(65);
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.events.on('ready', () => {
                emit('rendered');
            });

            const series = chart.series.push(new am4charts.PieSeries());
            if (props.printMode) series.showOnInit = true;
            series.dataFields.category = CATEGORY_KEY;
            series.dataFields.value = VALUE_KEY;
            series.labels.template.disabled = true;
            series.tooltip.disabled = true;
            series.tooltip.fontSize = 14;

            const sliceTemplate = series.slices.template;
            sliceTemplate.clickable = false;
            sliceTemplate.properties.hoverable = false;
            sliceTemplate.states.getKey('hover').properties.scale = 1;
            sliceTemplate.propertyFields.fill = 'color';
            sliceTemplate.adapter.add('tooltipText', (tooltipText, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const currencyMoney = currencyMoneyFormatter(target.dataItem.value, props.currency, props.currencyRates, true);
                    return getTooltipText(CATEGORY_KEY, VALUE_KEY, currencyMoney, false);
                }
                return tooltipText;
            });
            // sliceTemplate.tooltipText = '{category}: [bold]{currencyMoney}[/] ({value.percent.formatNumber(\'#.00\')}%)';
            // sliceTemplate.adapter.add('fill', (fill, target) => {
            //     if (target.dataItem.category === 'dummy') return am4core.color(gray[100]);
            //     return fill;
            // });

            if (isChartItemExists) {
                series.tooltip.disabled = false;

                chart.legend = new am4charts.Legend();
                chart.legend.contentAlign = 'left';
                chart.legend.fontSize = 12;
                chart.legend.valueLabels.template.text = '';
                chart.legend.useDefaultMarker = true;
                chart.legend.itemContainers.template.clickable = false;
                chart.legend.itemContainers.template.focusable = false;
                chart.legend.itemContainers.template.hoverable = false;
                chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
                chart.legend.labels.template.fill = am4core.color(gray[600]);

                const marker = chart.legend.markers.template;
                marker.children.getIndex(0)
                    .cornerRadius(12, 12, 12, 12);
                marker.width = 8;
                marker.height = 8;
            }
            state.chart = chart;
        };

        const costQueryHelper = new QueryHelper();
        const getData = async () => {
            state.loading = true;
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: [state.groupBy],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                    end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
                state.chartData = getPieChartData(results, state.groupBy);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.chartData = [];
            } finally {
                state.loading = false;
            }
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        });

        watch([() => props.period, () => props.filters], async () => {
            await getData();
            if (state.chartData.length === 0) emit('rendered');
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });
        return {
            ...toRefs(state),
            dataTableState,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cost-donut {
    .chart-wrapper {
        .chart {
            height: 15.2rem;
            width: 100%;
        }
    }

    .table-wrapper {
        .table {
            @apply w-full;
        }
    }
}
</style>
