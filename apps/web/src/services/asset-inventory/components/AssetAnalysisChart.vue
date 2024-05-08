<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import type * as am5percent from '@amcharts/amcharts5/percent';
import type { XYChart } from '@amcharts/amcharts5/xy';
import {
    PSelectButton, PSkeleton, PTextEditor, PEmpty,
} from '@spaceone/design-system';
import { debounce, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';

import { BASIC_CHART_COLORS, MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import AssetAnalysisChartLegends from '@/services/asset-inventory/components/AssetAnalysisChartLegends.vue';
import AssetAnalysisDonutChart from '@/services/asset-inventory/components/AssetAnalysisDonutChart.vue';
import AssetAnalysisHorizontalColumnChart
    from '@/services/asset-inventory/components/AssetAnalysisHorizontalColumnChart.vue';
import AssetAnalysisLineChart from '@/services/asset-inventory/components/AssetAnalysisLineChart.vue';
import AssetAnalysisTreeMapChart from '@/services/asset-inventory/components/AssetAnalysisTreeMapChart.vue';
import { CHART_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import {
    getFilteredRealtimeData,
    getMetricChartLegends,
    getRefinedMetricRealtimeChartData,
    getRefinedMetricXYChartData,
} from '@/services/asset-inventory/helpers/asset-analysis-chart-data-helper';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';
import type {
    ChartType,
    Legend,
    MetricDataAnalyzeResult,
    Period,
    RealtimeChartData,
    XYChartData,
} from '@/services/asset-inventory/types/asset-analysis-type';


const QUERY_OPTIONS_TYPE = 'query_options';
const SELECT_BUTTON_ITEMS = [
    { name: CHART_TYPE.LINE, icon: 'ic_chart-line' },
    { name: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
    { name: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
    { name: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
    { name: QUERY_OPTIONS_TYPE, icon: 'ic_editor-code' },
];

const route = useRoute();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;
const state = reactive({
    loading: true,
    currentMetricId: computed<string>(() => route.params.metricId),
    data: undefined as undefined|AnalyzeResponse<MetricDataAnalyzeResult>,
    chartData: [] as Array<XYChartData|RealtimeChartData>,
    legends: [] as Legend[],
    chart: null as XYChart|am5percent.PieChart| null,
    periodText: computed<string>(() => {
        if (isEmpty(assetAnalysisPageState.period)) return '';
        if (assetAnalysisPageGetters.isRealtimeChart) {
            return state.data?.results[0]?.date || '';
        }
        return `${assetAnalysisPageState.period.start} ~ ${assetAnalysisPageState.period.end}`;
    }),
    chartColorSet: computed(() => {
        const _isMassive = state.legends.length > BASIC_CHART_COLORS.length;
        const _index = SELECT_BUTTON_ITEMS.findIndex((item) => item.name === assetAnalysisPageState.selectedChartType);
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

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (): Promise<AnalyzeResponse<MetricDataAnalyzeResult>|undefined> => {
    try {
        analyzeApiQueryHelper.setFilters(assetAnalysisPageGetters.consoleFilters);
        const _groupBy = assetAnalysisPageState.selectedChartGroupBy ? [assetAnalysisPageState.selectedChartGroupBy] : [];
        const _sort = assetAnalysisPageGetters.isRealtimeChart ? [{ key: 'date', desc: true }] : [{ key: '_total_count', desc: true }];
        const _fieldGroup = assetAnalysisPageGetters.isRealtimeChart ? [] : ['date'];
        const { status, response } = await fetcher({
            metric_id: state.currentMetricId,
            query: {
                granularity: assetAnalysisPageState.granularity,
                group_by: _groupBy,
                start: assetAnalysisPageState.period?.start,
                end: assetAnalysisPageState.period?.end,
                fields: {
                    count: {
                        key: 'value',
                        operator: assetAnalysisPageState.selectedOperator,
                    },
                },
                sort: _sort,
                field_group: _fieldGroup,
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            if (assetAnalysisPageGetters.isRealtimeChart) {
                return getFilteredRealtimeData(response);
            }
            return response;
        }
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

    const _granularity = assetAnalysisPageState.granularity;
    const _period = assetAnalysisPageState.period as Period;
    const _groupBy = assetAnalysisPageState.selectedChartGroupBy;

    state.legends = getMetricChartLegends(assetAnalysisPageGetters.labelKeysReferenceMap, assetAnalysisPageState.selectedChartType, rawData, _groupBy);
    if (assetAnalysisPageGetters.isRealtimeChart) {
        state.chartData = getRefinedMetricRealtimeChartData(assetAnalysisPageGetters.labelKeysReferenceMap, rawData, _groupBy);
    } else {
        state.chartData = getRefinedMetricXYChartData(rawData, _granularity, _period, _groupBy);
    }
    state.loading = false;
}, 300);

/* Event */
const handleSelectButton = (selected: ChartType|string) => {
    state.loading = true;
    if (selected !== QUERY_OPTIONS_TYPE) {
        setChartData();
    }
    assetAnalysisPageStore.setSelectedChartType(selected);
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
    () => assetAnalysisPageState.period,
    () => assetAnalysisPageState.selectedOperator,
    () => assetAnalysisPageState.selectedChartGroupBy,
    () => assetAnalysisPageGetters.consoleFilters,
], async ([metricId]) => {
    if (!metricId) return;
    await setChartData();
}, { immediate: true });
watch(() => assetAnalysisPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await setChartData();
        assetAnalysisPageStore.setRefreshMetricData(false);
    }
}, { immediate: false });
</script>

<template>
    <div class="asset-analysis-chart">
        <div class="top-part">
            <div class="period-text">
                <span v-if="assetAnalysisPageState.selectedChartType !== QUERY_OPTIONS_TYPE">{{ state.periodText }}</span>
            </div>
            <div class="select-button-wrapper">
                <p-select-button v-for="item in SELECT_BUTTON_ITEMS"
                                 :key="`chart-select-button-${item.name}`"
                                 :selected="assetAnalysisPageState.selectedChartType"
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
            <template v-if="assetAnalysisPageState.selectedChartType !== QUERY_OPTIONS_TYPE">
                <div class="left-part">
                    <p-skeleton v-if="state.loading"
                                height="100%"
                    />
                    <template v-else-if="state.chartData.length">
                        <asset-analysis-line-chart
                            v-if="assetAnalysisPageState.selectedChartType === CHART_TYPE.LINE"
                            :loading="state.loading"
                            :chart.sync="state.chart"
                            :chart-data="state.chartData"
                            :legends="state.legends"
                            :color-set="state.chartColorSet"
                        />
                        <asset-analysis-donut-chart
                            v-else-if="assetAnalysisPageState.selectedChartType === CHART_TYPE.DONUT"
                            :loading="state.loading"
                            :chart.sync="state.chart"
                            :chart-data="state.chartData"
                            :legends="state.legends"
                            :color-set="state.chartColorSet"
                        />
                        <asset-analysis-tree-map-chart
                            v-else-if="assetAnalysisPageState.selectedChartType === CHART_TYPE.TREEMAP"
                            :loading="state.loading"
                            :chart-data="state.chartData"
                            :legends="state.legends"
                        />
                        <asset-analysis-horizontal-column-chart
                            v-else-if="assetAnalysisPageState.selectedChartType === CHART_TYPE.COLUMN"
                            :loading="state.loading"
                            :chart.sync="state.chart"
                            :chart-data="state.chartData"
                            :color-set="state.chartColorSet"
                        />
                    </template>
                    <p-empty v-else
                             class="empty-wrapper"
                    >
                        <span class="text-paragraph-md">{{ $t('INVENTORY.ASSET_ANALYSIS.NO_DATA') }}</span>
                    </p-empty>
                </div>
                <div class="right-part">
                    <asset-analysis-chart-legends :legends.sync="state.legends"
                                                  :loading="state.loading"
                                                  :more="state.data?.more"
                                                  :color-set="state.chartColorSet"
                                                  @toggle-series="handleToggleSeries"
                                                  @show-all-series="handleAllSeries('show')"
                                                  @hide-all-series="handleAllSeries('hide')"
                    />
                </div>
            </template>
            <p-text-editor
                v-if="assetAnalysisPageState.selectedChartType === QUERY_OPTIONS_TYPE"
                :code="assetAnalysisPageState.metric?.query_options"
                read-only
                class="query-options-editor"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-chart {
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
            .empty-wrapper {
                height: 100%;
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
