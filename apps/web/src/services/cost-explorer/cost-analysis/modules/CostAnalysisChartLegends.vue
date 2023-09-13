<script lang="ts" setup>
import {
    computed, defineEmits, reactive, watch,
} from 'vue';

import {
    PButton, PSelectDropdown, PStatus, PDataLoader,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { cloneDeep, sum } from 'lodash';

import { useProxyValue } from '@/common/composables/proxy-state';

import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import type { Legend } from '@/services/cost-explorer/cost-analysis/type';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';


interface Props {
    loading: boolean;
    legends: Legend[];
}
const props = withDefaults(defineProps<Props>(), {
    loading: false,
});
const emit = defineEmits<{(e: 'toggle-series', index: number): void;
    (e: 'hide-all-series'): void;
    (e: 'show-all-series'): void;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    filtersLength: computed<number>(() => {
        const selectedValues = Object.values(costAnalysisPageState.filters);
        return sum(selectedValues.map((v) => v?.length || 0));
    }),
    //
    proxyLegends: useProxyValue('legends', props, emit),
    groupByMenuItems: computed<SelectDropdownMenuItem[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) return GROUP_BY_ITEM_MAP[d];
        return {
            name: d, // tags.Name
            label: d.split('.')[1], // Name
        };
    })),
    showHideAll: computed(() => props.legends.some((legend) => !legend.disabled)),
});

/* Util */
const getLegendIconColor = (index) => {
    const legend = props.legends[index];
    if (legend?.disabled) return DISABLED_LEGEND_COLOR;
    if (legend?.color) return legend.color;
    return DEFAULT_CHART_COLORS[index];
};
const getLegendTextColor = (index) => {
    const legend = props.legends[index];
    if (legend?.disabled) return DISABLED_LEGEND_COLOR;
    return null;
};

/* Event */
const handleToggleSeries = (index) => {
    const _legends = cloneDeep(props.legends);
    _legends[index].disabled = !_legends[index]?.disabled;
    state.proxyLegends = _legends;
    emit('toggle-series', index);
};
const handleToggleAllLegends = () => {
    const _legends = cloneDeep(props.legends);
    if (state.showHideAll) {
        _legends.forEach((d) => {
            d.disabled = true;
        });
        emit('hide-all-series');
    } else {
        _legends.forEach((d) => {
            d.disabled = false;
        });
        emit('show-all-series');
    }
    state.proxyLegends = _legends;
};
const handleChartGroupByItem = (groupBy?: string) => {
    costAnalysisPageStore.$patch({ chartGroupBy: groupBy });
};

/* Watcher */
watch(() => state.groupByMenuItems, (after) => {
    if (!after.length) {
        costAnalysisPageStore.$patch({ chartGroupBy: undefined });
    } else if (!after.filter((d) => d.name === costAnalysisPageState.chartGroupBy).length) {
        costAnalysisPageStore.$patch({ chartGroupBy: after[0].name });
    }
});
</script>

<template>
    <div class="cost-analysis-chart-legends">
        <p-select-dropdown :items="state.groupByMenuItems"
                           :selected="costAnalysisPageState.chartGroupBy"
                           :disabled="!costAnalysisPageState.groupBy.length"
                           class="group-by-select-dropdown"
                           @select="handleChartGroupByItem"
        />
        <p-data-loader :loading="loading"
                       :data="legends"
                       class="legend-wrapper"
        >
            <p v-if="legends.length > 15"
               class="too-many-text"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOO_MANY_ITEMS') }}
            </p>
            <div v-for="(legend, idx) in legends"
                 :key="`legend-${legend.name}`"
                 class="legend"
                 @click="handleToggleSeries(idx)"
            >
                <p-status :text="legend.label"
                          :icon-color="getLegendIconColor(idx)"
                          :text-color="getLegendTextColor(idx)"
                />
            </div>
            <template #no-data>
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
            </template>
        </p-data-loader>
        <p-button style-type="transparent"
                  size="sm"
                  font-weight="normal"
                  @click="handleToggleAllLegends"
        >
            {{ state.showHideAll ? $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HIDE_ALL') : $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SHOW_ALL') }}
        </p-button>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-chart-legends {
    .group-by-select-dropdown {
        width: 100%;
        margin-bottom: 0.5rem;
    }
    .legend-wrapper {
        height: 20rem;
        overflow-y: auto;
        padding: 0.5rem 0;

        .too-many-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            padding: 0 0.5rem 0.5rem 0.5rem;
        }
        .legend {
            height: 25px;
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0 0.5rem;

            &:hover {
                @apply bg-gray-100;
            }
            &.disabled {
                @apply text-gray-300;
            }

            /* custom design-system component - p-status */
            :deep(.p-status) {
                .text {
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>
