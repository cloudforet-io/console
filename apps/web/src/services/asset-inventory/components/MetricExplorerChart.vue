<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, isEmpty } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PEmpty, PSelectButton, PSkeleton, PSelectDropdown, PButton,
} from '@cloudforet/mirinae';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';

import MetricExplorerDonutChart from '@/services/asset-inventory/components/MetricExplorerDonutChart.vue';
import MetricExplorerHorizontalColumnChart
    from '@/services/asset-inventory/components/MetricExplorerHorizontalColumnChart.vue';
import MetricExplorerLineChart from '@/services/asset-inventory/components/MetricExplorerLineChart.vue';
import MetricExplorerTreeMapChart from '@/services/asset-inventory/components/MetricExplorerMapChart.vue';
import { useMetricDataAnalyzePaginationQuery } from '@/services/asset-inventory/composables/use-metric-data-analyze-query';
import { useMetricGetQuery } from '@/services/asset-inventory/composables/use-metric-get-query';
import { CHART_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import {
    getFilteredRealtimeData,
} from '@/services/asset-inventory/helpers/asset-analysis-chart-data-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    ChartType,
    MetricDataAnalyzeResult,
} from '@/services/asset-inventory/types/asset-analysis-type';


const SELECT_BUTTON_ITEMS = [
    { name: CHART_TYPE.LINE_AREA, icon: 'ic_chart-area' },
    { name: CHART_TYPE.LINE, icon: 'ic_chart-line' },
    { name: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
    { name: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
    { name: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
];

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    currentMetricId: computed<string>(() => route.params.metricId),
    legend: {} as Record<string, boolean>,
    chartGroupByMenuItems: computed(() => labelKeys.value
        .filter((d) => metricExplorerPageState.selectedGroupByList.includes(d.key))
        .map((d) => ({ name: d.key, label: d.name }))),
    showHideAll: computed(() => Object.values(state.legend).some((d) => d)),
});
const refinedChartData = computed<AnalyzeResponse<MetricDataAnalyzeResult>>(() => {
    if (!metricDataAnalyzeData.value?.results?.length) return { more: false, results: [] };
    if (metricExplorerPageGetters.isRealtimeChart) {
        return getFilteredRealtimeData(metricDataAnalyzeData.value);
    }
    return metricDataAnalyzeData.value;
});

/* Query */
const { labelKeys } = useMetricGetQuery({
    metricId: computed(() => route.params.metricId),
});

const analyzeApiQueryHelper = new ApiQueryHelper();
const { data: metricDataAnalyzeData, isLoading: analyzeLoading, query: metricDataAnalyzeQuery } = useMetricDataAnalyzePaginationQuery({
    params: computed(() => {
        analyzeApiQueryHelper.setFilters(metricExplorerPageGetters.consoleFilters);
        const _groupBy = metricExplorerPageState.selectedChartGroupBy ? [metricExplorerPageState.selectedChartGroupBy] : [];
        const _sort = metricExplorerPageGetters.isRealtimeChart ? [{ key: 'count', desc: true }] : [{ key: 'date', desc: true }];
        const _fieldGroup = metricExplorerPageGetters.isRealtimeChart ? [] : ['date'];
        return {
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
        };
    }),
    thisPage: computed(() => 1),
    pageSize: computed(() => 15),
});

/* Event */
const handleSelectButton = (selected: ChartType) => {
    state.legend = {};
    metricExplorerPageStore.setSelectedChartType(selected);
};
const handleChartGroupByItem = (groupBy?: string) => {
    metricExplorerPageStore.setSelectedChartGroupBy(groupBy);
};
const handleToggleAllLegends = () => {
    const _legend = cloneDeep(state.legend);
    if (state.showHideAll) {
        Object.keys(_legend).forEach((d) => {
            _legend[d] = false;
        });
    } else {
        Object.keys(_legend).forEach((d) => {
            _legend[d] = true;
        });
    }
    state.legend = _legend;
};

/* Watcher */
watch(analyzeLoading, (loading) => {
    if (loading) state.legend = {};
});
watch(() => metricExplorerPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await metricDataAnalyzeQuery.refetch();
        metricExplorerPageStore.setRefreshMetricData(false);
    }
}, { immediate: false });
watch(() => metricExplorerPageState.selectedGroupByList, (after) => {
    if (!after.length) {
        metricExplorerPageStore.setSelectedChartGroupBy(undefined);
    } else if (!after.filter((d) => d === metricExplorerPageState.selectedChartGroupBy).length) {
        metricExplorerPageStore.setSelectedChartGroupBy(after[0]);
    }
});
</script>

<template>
    <div class="metric-explorer-chart">
        <div class="top-part">
            <p-select-dropdown :menu="state.chartGroupByMenuItems"
                               :selected="metricExplorerPageState.selectedChartGroupBy"
                               :disabled="!metricExplorerPageState.selectedGroupByList.length"
                               class="group-by-select-dropdown"
                               @select="handleChartGroupByItem"
            />
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
            <div class="bottom-right-part">
                <p v-if="refinedChartData?.more"
                   class="too-many-text"
                >
                    {{ $t('INVENTORY.METRIC_EXPLORER.SHOWING_TOP_15') }}
                </p>
                <p-button size="sm"
                          style-type="tertiary"
                          :disabled="isEmpty(state.legend)"
                          @click="handleToggleAllLegends"
                >
                    {{ state.showHideAll ? $t('INVENTORY.METRIC_EXPLORER.HIDE_ALL') : $t('INVENTORY.METRIC_EXPLORER.SHOW_ALL') }}
                </p-button>
            </div>
            <p-skeleton v-if="analyzeLoading"
                        height="100%"
            />
            <template v-else-if="refinedChartData?.results?.length">
                <metric-explorer-line-chart
                    v-if="!metricExplorerPageGetters.isRealtimeChart"
                    :loading="analyzeLoading"
                    :data="refinedChartData"
                    :legend.sync="state.legend"
                    :stacked="metricExplorerPageState.selectedChartType === CHART_TYPE.LINE_AREA"
                />
                <metric-explorer-donut-chart
                    v-else-if="metricExplorerPageState.selectedChartType === CHART_TYPE.DONUT"
                    :loading="analyzeLoading"
                    :data="refinedChartData"
                    :legend.sync="state.legend"
                />
                <metric-explorer-tree-map-chart
                    v-else-if="metricExplorerPageState.selectedChartType === CHART_TYPE.TREEMAP"
                    :loading="analyzeLoading"
                    :data="refinedChartData"
                />
                <metric-explorer-horizontal-column-chart
                    v-else-if="metricExplorerPageState.selectedChartType === CHART_TYPE.COLUMN"
                    :loading="analyzeLoading"
                    :data="refinedChartData"
                    :legend.sync="state.legend"
                />
            </template>
            <p-empty v-else
                     class="empty-wrapper"
            >
                <span class="text-paragraph-md">{{ $t('INVENTORY.METRIC_EXPLORER.NO_DATA') }}</span>
            </p-empty>
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
        text-align: right;
        .select-button-wrapper {
            display: flex;
            justify-content: flex-end;
            gap: 0.375rem;
            padding-bottom: 0.5rem;
        }
        .group-by-select-dropdown {
            width: 23%;
        }
    }
    .bottom-part {
        height: 25rem;
        margin-top: 1rem;
        .bottom-right-part {
            text-align: right;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-bottom: 0.5rem;
        }
        .too-many-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            padding-right: 0.5rem;
        }
        .empty-wrapper {
            height: 90%;
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
