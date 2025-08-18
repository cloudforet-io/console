<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import { cloneDeep, debounce, isEmpty } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';
import {
    PButton, PSelectButton,
    PSelectDropdown, PToggleButton, PFieldTitle,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import CostAnalysisStackedColumnChart
    from '@/services/cost-explorer/components/CostAnalysisStackedColumnChart.vue';
import { useCostAnalyzeQuery } from '@/services/cost-explorer/composables/use-cost-analyze-query';
import { useUnifiedCostAnalyzeQuery } from '@/services/cost-explorer/composables/use-unified-cost-analyze-query';
import {
    GRANULARITY, GROUP_BY_ITEM_MAP,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';
import type { CostAnalyzeRawData } from '@/services/cost-explorer/types/cost-analyze-type';
import type { CostXYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;
const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;
const costQuerySetGetters = costQuerySetStore.getters;

const state = reactive({
    loading: true,
    legend: {} as Record<string, boolean>,
    data: [] as CostAnalyzeRawData[],
    chartData: [] as CostXYChartData[],
    chart: null as XYChart | null,
    groupByMenuItems: computed<SelectDropdownMenuItem[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) return GROUP_BY_ITEM_MAP[d];
        return {
            name: d, // tags.Name
            label: d.split('.')[1], // Name
        };
    })),
    showHideAll: computed(() => Object.values(state.legend).some((d) => d)),
    showAccumulatedToggle: computed(() => costAnalysisPageState.granularity === GRANULARITY.DAILY),
    isAccumulated: false,
});

/* Util */
const getValueSumKey = (dataType:string) => {
    switch (dataType) {
    case 'cost':
        return costQuerySetState.isUnifiedCostOn ? `cost.${costAnalysisPageGetters.currency}` : 'cost';
    case 'usage':
        return 'usage_quantity';
    default:
        return `data.${dataType}`;
    }
};

/* Query */
const analyzeApiQueryHelper = new ApiQueryHelper();
const queryParams = computed<AnalyzeQuery|null>(() => {
    if (!costAnalysisPageState.period) return null;

    analyzeApiQueryHelper.setFilters(costAnalysisPageGetters.consoleFilters);
    let dateFormat = 'YYYY-MM';
    if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) dateFormat = 'YYYY';

    return {
        granularity: costAnalysisPageState.granularity,
        group_by: costAnalysisPageState.chartGroupBy ? [costAnalysisPageState.chartGroupBy] : [],
        start: dayjs.utc(costAnalysisPageState.period.start).format(dateFormat),
        end: dayjs.utc(costAnalysisPageState.period.end).format(dateFormat),
        fields: {
            value_sum: {
                key: getValueSumKey(costAnalysisPageState.displayDataType),
                operator: 'sum',
            },
        },
        sort: [{ key: '_total_value_sum', desc: true }],
        field_group: ['date'],
        ...analyzeApiQueryHelper.data,
    };
});

const { costAnalyzeData, isLoading } = (costQuerySetState.isUnifiedCostOn ? useUnifiedCostAnalyzeQuery : useCostAnalyzeQuery)({
    data_source_id: computed(() => costQuerySetGetters.dataSourceId),
    query: computed(() => queryParams.value ?? {}),
});

const setChartData = debounce(async () => {
    if (costAnalyzeData.value) {
        state.loading = true;
        state.data = costAnalyzeData.value.results ?? [];
        state.loading = false;
    }
}, 0);

/* Event */
const handleChartGroupByItem = (groupBy?: string) => {
    state.legend = {};
    costAnalysisPageStore.setChartGroupBy(groupBy);
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
const handleToggleAccumulated = (value: boolean) => {
    state.isAccumulated = value;
};

/* Watcher */
watch([
    () => costAnalysisPageState,
    () => costQuerySetState.selectedDataSourceId,
    () => costQuerySetState.selectedQuerySetId,
    () => costQuerySetState.isUnifiedCostOn,
    () => isLoading.value,
], ([, , , , loading]) => {
    if (costAnalysisPageState.period && !loading) {
        setChartData();
    }
}, { immediate: true, deep: true });
watch(() => state.groupByMenuItems, (after) => {
    if (!after.length) {
        costAnalysisPageStore.setChartGroupBy(undefined);
    } else if (!after.filter((d) => d.name === costAnalysisPageState.chartGroupBy).length) {
        costAnalysisPageStore.setChartGroupBy(after[0].name);
    }
});
watch([() => costAnalysisPageState.chartGroupBy, () => costAnalysisPageState.granularity], () => {
    state.legend = {};
});
watch(() => costAnalysisPageState.granularity, () => {
    if (state.isAccumulated) state.isAccumulated = false;
});
</script>

<template>
    <div class="cost-analysis-chart">
        <div class="top-part">
            <p-select-dropdown :menu="state.groupByMenuItems"
                               :selected="costAnalysisPageState.chartGroupBy"
                               :disabled="!costAnalysisPageState.groupBy.length"
                               class="group-by-select-dropdown"
                               @select="handleChartGroupByItem"
            />
            <div v-if="state.showAccumulatedToggle"
                 class="accumulated-toggle-wrapper"
            >
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ACCUMULATED') }}</p-field-title>
                <p-toggle-button :value="state.isAccumulated"
                                 @update:value="handleToggleAccumulated"
                />
            </div>
            <div class="select-button-wrapper">
                <p-select-button :selected="true"
                                 icon-name="ic_chart-bar"
                                 layout="icon-only"
                                 style-type="gray"
                                 size="sm"
                />
            </div>
        </div>
        <div class="bottom-part">
            <div class="bottom-right-part">
                <p v-if="costAnalyzeData?.more"
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
            <cost-analysis-stacked-column-chart :loading="state.loading"
                                                :data="state.data"
                                                :legend.sync="state.legend"
                                                :accumulated="state.isAccumulated"
                                                class="cost-analysis-stacked-column-chart"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-chart {
    @apply border border-gray-200 rounded-md;
    grid-gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;

    .top-part {
        display: flex;
        text-align: right;
        gap: 1rem;
        .accumulated-toggle-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .select-button-wrapper {
            display: flex;
            justify-content: flex-end;
            gap: 0.375rem;
            padding-bottom: 0.5rem;
            flex: 1;
        }
        .group-by-select-dropdown {
            width: 24%;
        }
    }
    .bottom-part {
        display: flex;
        flex-direction: column;
        height: 25rem;
        margin-top: 1rem;
        .cost-analysis-stacked-column-chart {
            flex: 1;
        }
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
    }
}
</style>
