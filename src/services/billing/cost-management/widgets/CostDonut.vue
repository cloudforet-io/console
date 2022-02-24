<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_PROVIDER')" class="cost-by-provider" :widget-link="widgetLink"
                                       :print-mode="printMode"
    >
        <p-data-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
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
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import {
    computed, reactive, toRefs, watch, onUnmounted, defineComponent,
} from '@vue/composition-api';

import {
    PDataLoader, PSkeleton, PDataTable, PTextPagination,
} from '@spaceone/design-system';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';

import { PieChart } from '@amcharts/amcharts4/charts';
import {
    CostAnalyzeModel, PieChartData, WidgetProps,
} from '@/services/billing/cost-management/widgets/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { forEach } from 'lodash';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { CURRENCY } from '@/store/modules/display/config';
import { store } from '@/store';
import { gray } from '@/styles/colors';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import config from '@/lib/config';
import { getTooltipText } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';


interface CostByProviderChartData extends PieChartData {
    color: string;
}

const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';

export default defineComponent<WidgetProps>({
    name: 'CostDonut',
    components: {
        CostDashboardCardWidgetLayout,
        PDataTable,
        PDataLoader,
        PSkeleton,
        PTextPagination,
        CostDashboardDataTable,
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
            chartRegistry: {},
            loading: false,
            chartData: [] as CostByProviderChartData[],
            chart: null as PieChart | null,
            pageSize: 5,
            thisPage: 1,
            providers: computed(() => store.state.resource.provider.items),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        groupBy: arrayToQueryString([GROUP_BY.PROVIDER]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
        });

        const dataTableState = reactive({
            fields: [
                { name: 'category', label: 'Provider' },
                { name: 'value', label: 'Cost', textAlign: 'right' },
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
            const noItemsChartData: CostByProviderChartData[] = [{ category: 'dummy', value: 1, color: gray[100] }];
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

        const convertToChartData = (rawData: CostAnalyzeModel[]) => {
            state.chartData = [];
            forEach(rawData, (d) => {
                state.chartData.push({
                    category: state.providers[d.provider]?.label || d.provider,
                    color: state.providers[d.provider]?.color || '',
                    value: d.usd_cost,
                });
            });
        };

        const costQueryHelper = new QueryHelper();
        const getData = async () => {
            state.loading = true;
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: [GROUP_BY.PROVIDER],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                    end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });

                if (results.length > 0) {
                    convertToChartData(results);
                } else {
                    state.chartData = [];
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        });

        watch([() => props.period, () => props.filters], () => {
            getData();
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
.cost-by-provider {
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
