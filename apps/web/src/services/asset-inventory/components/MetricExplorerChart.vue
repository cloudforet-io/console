<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type * as am5percent from '@amcharts/amcharts5/percent';
import type { XYChart } from '@amcharts/amcharts5/xy';
import {
    PSelectButton, PTextEditor,
} from '@spaceone/design-system';
import { debounce, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';

import MetricExplorerChartLegends from '@/services/asset-inventory/components/MetricExplorerChartLegends.vue';
import MetricExplorerDonutChart from '@/services/asset-inventory/components/MetricExplorerDonutChart.vue';
import MetricExplorerHorizontalColumnChart
    from '@/services/asset-inventory/components/MetricExplorerHorizontalColumnChart.vue';
import MetricExplorerLineChart from '@/services/asset-inventory/components/MetricExplorerLineChart.vue';
import MetricExplorerTreeMapChart from '@/services/asset-inventory/components/MetricExplorerTreeMapChart.vue';
import { CHART_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
import {
    getFilteredRealtimeData,
    getMetricChartLegends, getRefinedMetricRealtimeChartData, getRefinedMetricXYChartData,
} from '@/services/asset-inventory/helpers/metric-explorer-chart-data-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    ChartType, Legend, MetricDataAnalyzeResult, Period,
    XYChartData, RealtimeChartData,
} from '@/services/asset-inventory/types/metric-explorer-type';


const QUERY_OPTIONS_TYPE = 'query_options';
const SELECT_BUTTON_ITEMS = [
    { name: CHART_TYPE.LINE, icon: 'ic_chart-line' },
    { name: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
    { name: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
    { name: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
    { name: QUERY_OPTIONS_TYPE, icon: 'ic_editor-code' },
];
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: false,
    data: undefined as undefined|AnalyzeResponse<MetricDataAnalyzeResult>,
    selectedChartType: CHART_TYPE.LINE as ChartType|string,
    chartData: [] as Array<XYChartData|RealtimeChartData>,
    legends: [] as Legend[],
    chart: null as XYChart|am5percent.PieChart| null,
    isRealtimeChart: computed<boolean>(() => state.selectedChartType !== CHART_TYPE.LINE),
    periodText: computed<string>(() => {
        if (isEmpty(metricExplorerPageState.period)) return '';
        if (state.isRealtimeChart) {
            return state.data?.results[0]?.date || '';
        }
        return `${metricExplorerPageState.period.start} ~ ${metricExplorerPageState.period.end}`;
    }),
});

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (): Promise<AnalyzeResponse<MetricDataAnalyzeResult>|undefined> => {
    try {
        analyzeApiQueryHelper.setFilters(metricExplorerPageGetters.consoleFilters);
        const _groupBy = metricExplorerPageState.selectedChartGroupBy ? [metricExplorerPageState.selectedChartGroupBy] : [];
        const _sort = state.isRealtimeChart ? [{ key: 'date', desc: true }] : [{ key: '_total_count', desc: true }];
        const _fieldGroup = state.isRealtimeChart ? [] : ['date'];
        const { status, response } = await fetcher({
            metric_id: metricExplorerPageGetters.metricId as string,
            query: {
                granularity: metricExplorerPageState.granularity,
                group_by: _groupBy,
                start: metricExplorerPageState.period?.start,
                end: metricExplorerPageState.period?.end,
                fields: {
                    count: {
                        key: 'value',
                        operator: metricExplorerPageState.selectedOperator,
                    },
                },
                sort: _sort,
                field_group: _fieldGroup,
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return getFilteredRealtimeData(response);
        return undefined;
    } catch (e) {
        return { more: false, results: [] };
    }
};
const setChartData = debounce(async () => {
    state.loading = true;

    const rawData = await analyzeMetricData();
    if (!rawData) return;
    state.data = rawData;

    const _granularity = metricExplorerPageState.granularity;
    const _period = metricExplorerPageState.period as Period;
    const _groupBy = metricExplorerPageState.selectedChartGroupBy;

    state.legends = getMetricChartLegends(metricExplorerPageGetters.labelKeysReferenceMap, state.selectedChartType, rawData, _groupBy);
    if (state.isRealtimeChart) {
        state.chartData = getRefinedMetricRealtimeChartData(metricExplorerPageGetters.labelKeysReferenceMap, rawData, _groupBy);
    } else {
        state.chartData = getRefinedMetricXYChartData(rawData, _granularity, _period, _groupBy);
    }
    state.loading = false;
}, 300);

/* Event */
const handleSelectButton = (selected: ChartType|string) => {
    if (selected !== QUERY_OPTIONS_TYPE) {
        setChartData();
    }
    state.selectedChartType = selected;
};
const handleToggleSeries = (index: number) => {
    toggleSeries(state.chart as XYChart, index);
};
const handleAllSeries = (type: string) => {
    if (type === 'show') {
        showAllSeries(state.chart as XYChart);
    } else {
        hideAllSeries(state.chart as XYChart);
    }
};

watch([
    () => metricExplorerPageGetters.metricId,
    () => metricExplorerPageState.period,
    () => metricExplorerPageState.selectedOperator,
    () => metricExplorerPageState.selectedChartGroupBy,
    () => metricExplorerPageGetters.consoleFilters,
], async ([metricId]) => {
    if (!metricId) return;
    await setChartData();
}, { immediate: true });
watch(() => metricExplorerPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await setChartData();
        metricExplorerPageStore.setRefreshMetricData(false);
    }
}, { immediate: false });
</script>

<template>
    <div class="metric-explorer-chart">
        <div class="top-part">
            <div class="period-text">
                <span v-if="state.selectedChartType !== QUERY_OPTIONS_TYPE">{{ state.periodText }}</span>
            </div>
            <div class="select-button-wrapper">
                <p-select-button v-for="item in SELECT_BUTTON_ITEMS"
                                 :key="`chart-select-button-${item.name}`"
                                 :selected="state.selectedChartType"
                                 :value="item.name"
                                 :icon-name="item.icon"
                                 layout="icon-only"
                                 style-type="gray"
                                 size="sm"
                                 @change="handleSelectButton"
                />
            </div>
        </div>
        <div class="bottom-part">
            <template v-if="state.selectedChartType !== QUERY_OPTIONS_TYPE">
                <div class="left-part">
                    <metric-explorer-line-chart
                        v-if="state.selectedChartType === CHART_TYPE.LINE"
                        :loading="state.loading"
                        :chart.sync="state.chart"
                        :chart-data="state.chartData"
                        :legends="state.legends"
                    />
                    <metric-explorer-donut-chart
                        v-else-if="state.selectedChartType === CHART_TYPE.DONUT"
                        :loading="state.loading"
                        :chart.sync="state.chart"
                        :chart-data="state.chartData"
                        :legends="state.legends"
                    />
                    <metric-explorer-tree-map-chart
                        v-else-if="state.selectedChartType === CHART_TYPE.TREEMAP"
                        :loading="state.loading"
                        :chart-data="state.chartData"
                        :legends="state.legends"
                    />
                    <metric-explorer-horizontal-column-chart
                        v-else-if="state.selectedChartType === CHART_TYPE.COLUMN"
                        :loading="state.loading"
                        :chart.sync="state.chart"
                        :chart-data="state.chartData"
                    />
                </div>
                <div class="right-part">
                    <metric-explorer-chart-legends :legends.sync="state.legends"
                                                   :loading="state.loading"
                                                   :more="state.data?.more"
                                                   :chart-type="state.selectedChartType"
                                                   @toggle-series="handleToggleSeries"
                                                   @show-all-series="handleAllSeries('show')"
                                                   @hide-all-series="handleAllSeries('hide')"
                    />
                </div>
            </template>
            <p-text-editor
                v-if="state.selectedChartType === QUERY_OPTIONS_TYPE"
                :code="metricExplorerPageState.metric?.query_options"
                read-only
                class="query-options-editor"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-chart {
    @apply border border-gray-200 rounded-md;
    padding: 1rem;
    margin-bottom: 1rem;
    .top-part {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.75rem;
        .period-text {
            @apply text-label-md text-gray-600;
            font-weight: 400;
            padding-right: 0.125rem;
        }
        .select-button-wrapper {
            display: flex;
            gap: 0.375rem;
        }
    }
    .bottom-part {
        @apply grid grid-cols-12;
        grid-gap: 1rem;
        .left-part {
            @apply col-span-9;
            height: 25rem;
            .chart-wrapper {
                padding-top: 0.5rem;
                padding-bottom: 1rem;
            }
        }
        .right-part {
            @apply col-span-3;
        }
        .query-options-editor {
            @apply col-span-12;
        }

        /* custom design-system component - p-text-editor */
        :deep(.p-text-editor) {
            .CodeMirror {
                height: 25rem;
            }
        }
    }
}
</style>
