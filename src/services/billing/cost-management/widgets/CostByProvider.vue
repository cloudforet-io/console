<template>
    <cost-dashboard-card-widget-layout title="Cost by Provider" class="cost-by-provider" :widget-link="widgetLink">
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <p-data-table :fields="dataTableState.fields"
                          :items="dataTableState.slicedItem"
                          :total-count="chartData.length"
                          :loading="loading"
                          table-style-type="simple"
                          disable-hover
                          class="table"
            >
                <template #col-provider-format="{item}">
                    {{ item.category }}
                </template>
                <template #col-value-format="{value}">
                    <div class="cost-col-body">
                        {{ currencyMoneyFormatter(value, currency, currencyRates) }}
                    </div>
                </template>
            </p-data-table>
            <div class="pagination">
                <p-text-pagination v-if="!!chartData.length" :all-page="allPage"
                                   :this-page.sync="thisPage"
                />
            </div>
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
    PChartLoader, PSkeleton, PDataTable, PTextPagination,
} from '@spaceone/design-system';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';

import { PieChart } from '@amcharts/amcharts4/charts';
import { PieChartData, PieChartRawData, WidgetProps } from '@/services/billing/cost-management/widgets/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { forEach } from 'lodash';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { CURRENCY } from '@/store/modules/display/config';
import { store } from '@/store';
import { gray } from '@/styles/colors';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';


interface CostByProviderChartData extends PieChartData {
    color: string;
}

interface CostByProviderAnalysisModel extends PieChartRawData {
    provider: string;
}

export default defineComponent<WidgetProps>({
    name: 'CostByProvider',
    components: {
        CostDashboardCardWidgetLayout,
        PDataTable,
        PChartLoader,
        PSkeleton,
        PTextPagination,
    },
    props: {
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
    },
    setup(props: WidgetProps) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chartRegistry: {},
            loading: false,
            chartData: [] as CostByProviderChartData[],
            chart: null as PieChart | null,
            pageSize: 5,
            thisPage: 1,
            totalCount: computed(() => state.chartData.length),
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            providers: computed(() => store.state.resource.provider.items),
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                    groupBy: arrayToQueryString([GROUP_BY.PROVIDER]),
                    period: objectToQueryString(props.period),
                    filters: objectToQueryString(props.filters),
                },
            })),
        });

        const dataTableState = reactive({
            fields: [
                { name: GROUP_BY.PROVIDER, label: 'Provider' },
                { name: 'value', label: 'Cost', textAlign: 'right' },
            ] as DataTableField[],
            slicedItem: computed<CostByProviderChartData[]>(() => {
                const startIndex = state.thisPage * state.pageSize - state.pageSize;
                const endIndex = state.thisPage * state.pageSize;
                return state.chartData.slice(startIndex, endIndex);
            }),
            contextKey: Math.floor(Math.random() * Date.now()),
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
            const chartData = isChartItemExists ? state.chartData : noItemsChartData;
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.PieChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            chart.data = chartData;
            chart.innerRadius = am4core.percent(65);
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;

            const series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = 'value';
            series.dataFields.category = 'category';
            series.labels.template.disabled = true;
            series.tooltip.disabled = true;

            const sliceTemplate = series.slices.template;
            sliceTemplate.clickable = false;
            sliceTemplate.properties.hoverable = false;
            sliceTemplate.states.getKey('hover').properties.scale = 1;
            sliceTemplate.propertyFields.fill = 'color';
            sliceTemplate.tooltipText = '{category}: $ {value}';
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

                const marker = chart.legend.markers.template;
                marker.children.getIndex(0)
                    .cornerRadius(12, 12, 12, 12);
                marker.width = 8;
                marker.height = 8;
            }
            state.chart = chart;
        };

        const convertToChartData = (rawData: CostByProviderAnalysisModel[]) => {
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
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: [GROUP_BY.PROVIDER],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM-DD'),
                    end: dayjs.utc(props.period?.end).endOf('month').format('YYYY-MM-DD'),
                    page: {
                        start: 1,
                        limit: 15,
                    },
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
            currencyMoneyFormatter,
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
            height: initial;
        }

        .pagination {
            @apply flex justify-center;
            margin-top: 0.5rem;
        }
    }
}
</style>
