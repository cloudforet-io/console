<script setup lang="ts">
import {
    reactive,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PDataLoader } from '@spaceone/design-system';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidget } from '@/common/modules/widgets/_composables/use-widget/use-widget';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    NewWidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


// const dataSourceFetcherMap = {
//     'cost_analysis.Cost': SpaceConnector.clientV2.costAnalysis.cost.analyze,
//     'cost_analysis.BudgetUsage': SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze,
//     'inventory.MetricData': SpaceConnector.clientV2.inventory.metricData.analyze,
// };

// interface SubData { date: string; value: number }
// interface Data {
//     value_sum: SubData[];
//     _total_value_sum: number;
//     [parsedDataField: string]: any; // provider: aws or provider: azure
// }
// interface ChartData {
//     date: string;
//     [parsedDataField: string]: any; // e.g. aws: 12333 or azure: 1234
// }
// type Response = CostAnalyzeResponse<Data>;

// const DATE_FORMAT = 'YYYY-MM';
// const DATE_FIELD_NAME = 'date';

const props = defineProps<NewWidgetProps>();
const emit = defineEmits<WidgetEmit>();

// const chartContext = ref<HTMLElement|null>(null);
// const chartHelper = useAmcharts5(chartContext);

const { widgetState } = useWidget(props, emit);
// const { widgetChartState } = useWidgetChart(props);
// const { widgetDataState } = useWidgetDataState(props);
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

const state = reactive({
    loading: true,
    data: null as Response | null,
    chart: null as null | XYChart,
    // dataType: computed<string|undefined>(() => (widgetState.options.cost_data_type)),
    chartData: [],
    // chartData: computed<ChartData[]>(() => {
    //     if (!state.data?.results) return [];
    //
    //     const chartData: ChartData[] = getRefinedXYChartData<Data, ChartData>(state.data.results, {
    //         dataField: widgetState.parsedDataField,
    //         arrayDataKey: 'value_sum',
    //         categoryKey: DATE_FIELD_NAME,
    //         valueKey: 'value',
    //     });
    //     return sortBy<ChartData>(chartData, widgetState.dateRange, DATE_FIELD_NAME);
    // }),
    // legends: computed<Legend[]>(() => {
    //     const data = state.data?.results ?? [];
    //     const legends: Legend[] = getXYChartLegends(data, widgetState.parsedDataField, props.allReferenceTypeInfo);
    //     return legends;
    // }),
    // disableReferenceColor: computed<boolean>(() => !!props.theme),
});

// const { pageSize, thisPage } = useWidgetPagination(widgetState);

/* Api */
// const apiQueryHelper = new ApiQueryHelper();
// const fetchCostAnalyze = getCancellableFetcher<object, Response>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
// const fetchData = async (): Promise<Response|null> => {
//     try {
//         // if (!state.dataType) {
//         //     throw new Error('data type is not defined');
//         // }
//
//         // apiQueryHelper.setFilters(widgetState.consoleFilters);
//         // if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);
//
//         const dataField = [widgetState.dataField, 'date'];
//         if (state.dataType === 'usage_quantity') {
//             dataField.push('usage_unit');
//         }
//
//         const { status, response } = await fetchCostAnalyze({
//             data_source_id: widgetState.options.cost_data_source,
//             query: {
//                 granularity: widgetState.granularity,
//                 group_by: dataField,
//                 start: widgetState.dateRange.start,
//                 end: widgetState.dateRange.end,
//                 fields: {
//                     value_sum: {
//                         key: state.dataType,
//                         operator: 'sum',
//                     },
//                 },
//                 sort: [{ key: '_total_value_sum', desc: true }],
//                 field_group: ['date'],
//                 ...apiQueryHelper.data,
//             },
//         });
//         if (status === 'succeed') {
//             return {
//                 results: response.results,
//                 more: response.more,
//             };
//         }
//         return state.data;
//     } catch (e) {
//         ErrorHandler.handleError(e);
//         return { results: [], more: false };
//     }
// };

/* Util */
// const drawChart = (chartData: ChartData[]) => {
//     const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));
//
//     // set base interval of xAxis
//     xAxis.get('baseInterval').timeUnit = 'month';
//
//     // set chart colors
//     // chartHelper.setChartColors(chart, colorSet.value);
//
//     // hide zoom button
//     chart.zoomOutButton.set('forceHidden', true);
//
//     // set series
//     state.legends.forEach((legend) => {
//         const seriesSettings = {
//             name: legend.label as string,
//             valueYField: legend.name,
//         };
//
//         // create series
//         const series = chartHelper.createXYColumnSeries(chart, { ...seriesSettings, stacked: true });
//         chart.series.push(series);
//
//         // set data processor on series
//         series.data.processor = chartHelper.createDataProcessor({
//             dateFormat: DATE_FORMAT,
//             dateFields: [DATE_FIELD_NAME],
//         });
//
//         // create tooltip and set on series
//         const tooltip = chartHelper.createTooltip();
//         chartHelper.setXYSharedTooltipText(
//             chart,
//             tooltip,
//         );
//         (series as Series).set('tooltip', tooltip);
//
//         // set data on series
//         series.data.setAll(cloneDeep(chartData));
//
//         state.chart = chart;
//     });
//
//     // set chart legends if enabled
//     // if (widgetState.options.legend_options?.enabled && widgetState.options.legend_options.show_at === 'chart') {
//     const chartLegends = chartHelper.createLegend({
//         nameField: 'name',
//     });
//     chart.children.push(chartLegends);
//     chartLegends.data.setAll(chart.series.values);
//     // }
//     state.chart = chart;
// };

// const initWidget = async (data?: Response): Promise<Response> => {
//     state.loading = true;
//     // TODO: data source를 돌며 fetchData
//     state.data = data ?? await fetchData();
//     await nextTick();
//     if (chartHelper.root.value) drawChart(state.chartData);
//     state.loading = false;
//     return state.data;
// };
//
// const refreshWidget = async (_thisPage = 1): Promise<Response> => {
//     await nextTick();
//     state.loading = true;
//     thisPage.value = _thisPage;
//     state.data = await fetchData();
//     chartHelper.refreshRoot();
//     await nextTick();
//     if (chartHelper.root.value) drawChart(state.chartData);
//     state.loading = false;
//     return state.data;
// };

// useWidgetLifecycle({
//     disposeWidget: chartHelper.disposeRoot,
//     initWidget,
//     refreshWidget,
//     props,
//     emit,
//     widgetState,
//     onCurrencyUpdate: async () => {
//         if (!state.data) return;
//         chartHelper.refreshRoot();
//         await nextTick();
//         if (chartHelper.root.value) drawChart(state.chartData);
//     },
// });

// defineExpose<WidgetExpose<Response>>({
//     initWidget,
//     refreshWidget,
// });
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div v-if="state.data?.results?.length"
                 class="chart-wrapper"
            >
                <p-data-loader class="chart-loader"
                               :data="state.chartData"
                               loader-type="skeleton"
                               disable-empty-case
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.data-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    .chart-wrapper {
        height: 12rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
