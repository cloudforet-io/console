<template>
    <cost-dashboard-card-widget-layout title="SPC Project-Wise Usage Summary" class="spc-project-wise-usage-summary"
                                       :data-range="20"
    >
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="tableState.fields"
                                       :items="tableState.items"
                                       :loading="tableState.loading"
                                       :chart="chart"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :page-size="10"
                                       :pagination-visible="false"
                                       show-legend
                                       class="table table-left"
                                       @toggle-legend="handleToggleLegend"
            />
            <cost-dashboard-data-table v-if="tableState.items.length > 10"
                                       :fields="tableState.fields"
                                       :items="tableState.secondTableItems"
                                       :loading="tableState.loading"
                                       :chart="chart"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :page-size="10"
                                       :pagination-visible="false"
                                       show-legend
                                       class="table table-right"
                                       @toggle-legend="handleToggleLegend"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { PieChart } from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import {
    Legend, PieChartData, PieChartRawData, WidgetProps,
} from '@/services/billing/cost-management/widgets/type';
import { CURRENCY } from '@/store/modules/display/config';
import CostDashboardDataTable from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';
import { getPieChartDataAndLegends } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { store } from '@/store';
import { PChartLoader, PSkeleton } from '@spaceone/design-system';
import { gray } from '@/styles/colors';


const categoryKey = 'category';
const valueName = 'value';

interface ChartData extends PieChartRawData {
    project_id: string;
    usd_cost: number;
}

export default defineComponent<WidgetProps>({
    name: 'SpcProjectWiseUsageSummary',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PChartLoader,
        PSkeleton,
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
            chart: null as PieChart | null,
            chartRegistry: {},
            loading: false,
            chartData: [] as PieChartData[],
            legends: [] as Legend[],
            projects: computed(() => store.state.resource.project.items),
        });
        const tableState = reactive({
            loading: false,
            items: [],
            secondTableItems: computed(() => tableState.items.slice(10, 20)),
            fields: computed(() => [
                { name: 'project_id', label: 'Project' },
                { name: 'usd_cost', label: 'Accumulated Spent', textAlign: 'right' },
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
            chart.radius = am4core.percent(100);
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            if (state.chartData.length === 0) {
                chart.data = [{
                    category: 'No Data',
                    value: 1,
                    color: am4core.color(gray[100]),
                }];
            } else chart.data = state.chartData;
            const pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = valueName;
            pieSeries.dataFields.category = categoryKey;
            pieSeries.labels.template.disabled = true;
            pieSeries.slices.template.propertyFields.fill = 'color';
        };

        const getData = async () => {
            try {
                state.loading = true;
                tableState.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: ['project_id'],
                    start: props.period.start,
                    end: props.period.end,
                    page: {
                        limit: 20,
                    },
                });
                const { chartData, legends } = getPieChartDataAndLegends(results, GROUP_BY.PROJECT);
                state.chartData = chartData.map(d => ({
                    ...d,
                    category: state.projects[d.category].label || d.category,
                }));
                state.legends = legends;

                tableState.items = results.map(d => ({
                    ...d,
                    project_id: state.projects[d.project_id].label || d.project_id,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.chartData = [];
            } finally {
                state.loading = false;
                tableState.loading = false;
            }
        };

        const handleToggleLegend = (index) => {
            state.legends[index].disabled = !state.legends[index]?.disabled;
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        watch(() => props.period, () => {
            getData();
        }, { immediate: true });

        return {
            ...toRefs(state),
            tableState,
            handleToggleLegend,
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
    .table-right::v-deep {
        @apply border-t border-gray-200;
        .p-data-table th {
            display: none;
        }
    }
}
</style>
