<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import type * as am5percent from '@amcharts/amcharts5/percent';
import type { XYChart } from '@amcharts/amcharts5/xy';
import { PEmpty, PSelectButton, PSkeleton } from '@spaceone/design-system';
import { debounce, isEmpty, sumBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';

import { BASIC_CHART_COLORS, MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import MetricExplorerChartLegends from '@/services/asset-inventory/components/MetricExplorerChartLegends.vue';
import MetricExplorerDonutChart from '@/services/asset-inventory/components/MetricExplorerDonutChart.vue';
import MetricExplorerHorizontalColumnChart
    from '@/services/asset-inventory/components/MetricExplorerHorizontalColumnChart.vue';
import MetricExplorerLineChart from '@/services/asset-inventory/components/MetricExplorerLineChart.vue';
import MetricExplorerTreeMapChart from '@/services/asset-inventory/components/MetricExplorerMapChart.vue';
import { CHART_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import {
    getFilteredRealtimeData,
    getMetricChartLegends,
    getRefinedMetricRealtimeChartData,
    getRefinedMetricXYChartData,
} from '@/services/asset-inventory/helpers/asset-analysis-chart-data-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    ChartType,
    Legend,
    MetricDataAnalyzeResult,
    Period,
    RealtimeChartData,
    XYChartData,
} from '@/services/asset-inventory/types/asset-analysis-type';


const SELECT_BUTTON_ITEMS = [
    { name: CHART_TYPE.LINE_AREA, icon: 'ic_chart-area' },
    { name: CHART_TYPE.LINE, icon: 'ic_chart-line' },
    { name: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
    { name: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
    { name: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
];
const OTHER_CATEGORY = 'Others';

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: true,
    currentMetricId: computed<string>(() => route.params.metricId),
    data: undefined as undefined|AnalyzeResponse<MetricDataAnalyzeResult>,
    chartData: [] as Array<XYChartData|RealtimeChartData>,
    legends: [] as Legend[],
    chart: null as XYChart|am5percent.PieChart| null,
    periodText: computed<string>(() => {
        if (isEmpty(metricExplorerPageState.period)) return '';
        if (metricExplorerPageGetters.isRealtimeChart) {
            return state.data?.results[0]?.date || '';
        }
        return `${metricExplorerPageState.period.start} ~ ${metricExplorerPageState.period.end}`;
    }),
    chartColorSet: computed(() => {
        const _isMassive = state.legends.length > BASIC_CHART_COLORS.length;
        const _index = SELECT_BUTTON_ITEMS.findIndex((item) => item.name === metricExplorerPageState.selectedChartType);
        const _sliceIndex = _isMassive ? _index * 4 : _index * 2;
        let _colorSet = MASSIVE_CHART_COLORS;
        if (!_isMassive) {
            _colorSet = BASIC_CHART_COLORS;
        }
        const firstPart = _colorSet.slice(_sliceIndex);
        const secondPart = _colorSet.slice(0, _sliceIndex);
        return firstPart.concat(secondPart).slice(0, state.legends.length);
    }),
});

/* Util */
const setPeriodText = () => {
    let periodText = '';
    if (isEmpty(metricExplorerPageState.period)) {
        periodText = '';
    } else if (metricExplorerPageGetters.isRealtimeChart) {
        periodText = state.data?.results[0]?.date || '';
    } else {
        periodText = `${metricExplorerPageState.period.start} ~ ${metricExplorerPageState.period.end}`;
    }
    metricExplorerPageStore.setPeriodText(periodText);
};
const getRefinedDonutChartData = (res: AnalyzeResponse<MetricDataAnalyzeResult>): AnalyzeResponse<MetricDataAnalyzeResult> => {
    const _results: MetricDataAnalyzeResult[] = [];
    const _totalAmount = sumBy(res.results, 'count');
    const _thresholdValue = _totalAmount * 0.02;
    let _othersValueSum = 0;
    const _refinedGroupByKey = metricExplorerPageState.selectedChartGroupBy?.replace('labels.', '') as string;
    res.results?.forEach((d) => {
        if (typeof d.count === 'number' && (d.count < _thresholdValue)) {
            _othersValueSum += d.count;
        } else {
            _results.push(d);
        }
    });
    if (_othersValueSum > 0) {
        _results.push({
            [_refinedGroupByKey]: OTHER_CATEGORY,
            count: _othersValueSum,
        });
    }
    return {
        more: res.more,
        results: _results,
    };
};

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (): Promise<AnalyzeResponse<MetricDataAnalyzeResult>|undefined> => {
    try {
        analyzeApiQueryHelper.setFilters(metricExplorerPageGetters.consoleFilters);
        const _groupBy = metricExplorerPageState.selectedChartGroupBy ? [metricExplorerPageState.selectedChartGroupBy] : [];
        const _sort = metricExplorerPageGetters.isRealtimeChart ? [{ key: 'count', desc: true }] : [{ key: 'date', desc: true }];
        const _fieldGroup = metricExplorerPageGetters.isRealtimeChart ? [] : ['date'];
        const { status, response } = await fetcher({
            metric_id: state.currentMetricId,
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
        if (status === 'succeed') {
            if (metricExplorerPageGetters.isRealtimeChart) {
                return getFilteredRealtimeData(response);
            }
            return response;
        }
        return undefined;
    } catch (e) {
        return { more: false, results: [] };
    }
};
const setChartData = debounce(async (analyze = true) => {
    state.loading = true;

    if (analyze) {
        const rawData = await analyzeMetricData();
        if (!rawData) return;
        state.data = rawData;
    }
    if (metricExplorerPageState.selectedChartType === CHART_TYPE.DONUT) {
        state.data = getRefinedDonutChartData(state.data as AnalyzeResponse<MetricDataAnalyzeResult>);
    }

    setPeriodText();

    const _granularity = metricExplorerPageState.granularity;
    const _period = metricExplorerPageState.period as Period;
    const _groupBy = metricExplorerPageState.selectedChartGroupBy;

    state.legends = getMetricChartLegends(metricExplorerPageGetters.labelKeysReferenceMap, metricExplorerPageState.selectedChartType, state.data, _groupBy);
    if (metricExplorerPageGetters.isRealtimeChart) {
        state.chartData = getRefinedMetricRealtimeChartData(metricExplorerPageGetters.labelKeysReferenceMap, state.data, _groupBy);
    } else {
        state.chartData = getRefinedMetricXYChartData(state.data, _granularity, _period, _groupBy);
    }
    state.loading = false;
}, 300);

/* Event */
const handleSelectButton = (selected: ChartType|string) => {
    state.loading = true;
    let analyzeData = false;
    const timeSeriesChartList = [CHART_TYPE.LINE, CHART_TYPE.LINE_AREA];
    if ((metricExplorerPageGetters.isRealtimeChart && timeSeriesChartList.includes(selected))
        || (!metricExplorerPageGetters.isRealtimeChart && !timeSeriesChartList.includes(selected))) {
        analyzeData = true;
    }
    setChartData(analyzeData);
    metricExplorerPageStore.setSelectedChartType(selected);
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
    () => state.currentMetricId,
    () => metricExplorerPageState.metricInitiated,
    () => metricExplorerPageState.period,
    () => metricExplorerPageState.selectedOperator,
    () => metricExplorerPageState.selectedChartGroupBy,
    () => metricExplorerPageGetters.consoleFilters,
], async ([metricId, metricInitiated]) => {
    if (!metricId || !metricInitiated) return;
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
            <div class="select-button-wrapper">
                <p-select-button v-for="item in SELECT_BUTTON_ITEMS"
                                 :key="`chart-select-button-${item.name}`"
                                 :selected="metricExplorerPageState.selectedChartType"
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
            <div class="left-part">
                <p-skeleton v-if="state.loading"
                            height="100%"
                />
                <template v-else-if="state.chartData.length">
                    <metric-explorer-line-chart
                        v-if="!metricExplorerPageGetters.isRealtimeChart"
                        :loading="state.loading"
                        :chart.sync="state.chart"
                        :chart-data="state.chartData"
                        :legends="state.legends"
                        :color-set="state.chartColorSet"
                        :stacked="metricExplorerPageState.selectedChartType === CHART_TYPE.LINE_AREA"
                    />
                    <metric-explorer-donut-chart
                        v-else-if="metricExplorerPageState.selectedChartType === CHART_TYPE.DONUT"
                        :loading="state.loading"
                        :chart.sync="state.chart"
                        :chart-data="state.chartData"
                        :legends="state.legends"
                        :color-set="state.chartColorSet"
                    />
                    <metric-explorer-tree-map-chart
                        v-else-if="metricExplorerPageState.selectedChartType === CHART_TYPE.TREEMAP"
                        :loading="state.loading"
                        :chart-data="state.chartData"
                        :legends="state.legends"
                    />
                    <metric-explorer-horizontal-column-chart
                        v-else-if="metricExplorerPageState.selectedChartType === CHART_TYPE.COLUMN"
                        :loading="state.loading"
                        :chart.sync="state.chart"
                        :chart-data="state.chartData"
                        :color-set="state.chartColorSet"
                    />
                </template>
                <p-empty v-else
                         class="empty-wrapper"
                >
                    <span class="text-paragraph-md">{{ $t('INVENTORY.METRIC_EXPLORER.NO_DATA') }}</span>
                </p-empty>
            </div>
            <div class="right-part">
                <metric-explorer-chart-legends :legends.sync="state.legends"
                                               :loading="state.loading"
                                               :more="state.data?.more"
                                               :color-set="state.chartColorSet"
                                               @toggle-series="handleToggleSeries"
                                               @show-all-series="handleAllSeries('show')"
                                               @hide-all-series="handleAllSeries('hide')"
                />
            </div>
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
        justify-content: flex-end;
        align-items: center;
        padding-bottom: 0.75rem;
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
            .empty-wrapper {
                height: 100%;
            }
        }
        .right-part {
            @apply col-span-3;
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
