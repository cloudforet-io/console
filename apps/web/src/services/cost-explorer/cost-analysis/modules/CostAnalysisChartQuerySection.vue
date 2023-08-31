<script lang="ts" setup>

import {
    PButton, PIconButton, PSelectDropdown, PStatus, PDataLoader,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { cloneDeep, sum } from 'lodash';
import {
    computed, defineEmits, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useProxyValue } from '@/common/composables/proxy-state';

import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import type { Legend } from '@/services/cost-explorer/cost-analysis/type';
import { FILTER, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import CostExplorerFilterTags from '@/services/cost-explorer/modules/CostExplorerFilterTags.vue';
import CostExplorerSetFilterModal from '@/services/cost-explorer/modules/CostExplorerSetFilterModal.vue';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { CostFiltersMap } from '@/services/cost-explorer/type';


const CATEGORIES = Object.values(FILTER);

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

const { t } = useI18n();

const state = reactive({
    filtersLength: computed<number>(() => {
        const selectedValues = Object.values(costAnalysisPageState.filters);
        return sum(selectedValues.map((v) => v?.length || 0));
    }),
    filterModalVisible: false,
    //
    proxyLegends: useProxyValue('legends', props, emit),
    groupByMenuItems: computed<SelectDropdownMenu[]>(() => {
        const groupByItems = costAnalysisPageState.groupBy.map((d) => GROUP_BY_ITEM_MAP[d]);
        const moreGroupByItems = costAnalysisPageStore.orderedMoreGroupByItems.filter((d) => d.selected).map((d) => ({
            name: `${d.category}.${d.key}`,
            label: d.key,
        }));
        return [...groupByItems, ...moreGroupByItems];
    }),
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
const handleClickAddFilterButton = () => {
    state.filterModalVisible = true;
};
const handleUpdateFilters = (filters: CostFiltersMap) => {
    costAnalysisPageStore.$patch((_state) => {
        _state.filters = filters;
    });
};
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
    <div class="cost-analysis-chart-query-section">
        <!--filter-->
        <div class="title-wrapper">
            <span class="title">{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER') }}</span>
            <div class="button-wrapper">
                <p-button style-type="tertiary"
                          size="sm"
                          :disabled="!state.filtersLength"
                          @click="handleUpdateFilters({})"
                >
                    {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CLEAR_ALL') }}
                </p-button>
                <p-icon-button name="ic_plus"
                               style-type="tertiary"
                               shape="square"
                               size="sm"
                               @click="handleClickAddFilterButton"
                />
            </div>
        </div>
        <div class="filter-wrapper">
            <cost-explorer-filter-tags :filters="costAnalysisPageState.filters"
                                       deletable
                                       @update-filter-tags="handleUpdateFilters"
            />
        </div>

        <!--legend-->
        <div class="title-wrapper">
            <p-select-dropdown v-if="state.groupByMenuItems.length"
                               :items="state.groupByMenuItems"
                               :selected="costAnalysisPageState.chartGroupBy"
                               style-type="transparent"
                               @select="handleChartGroupByItem"
            />
            <span v-else
                  class="title"
            >Total Cost</span>
            <div class="button-wrapper">
                <p-button style-type="tertiary"
                          size="sm"
                          font-weight="normal"
                          @click="handleToggleAllLegends"
                >
                    {{ state.showHideAll ? t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HIDE_ALL') : t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SHOW_ALL') }}
                </p-button>
            </div>
        </div>
        <p-data-loader :loading="loading"
                       :data="legends"
                       class="legend-wrapper"
        >
            <p v-if="legends.length > 15"
               class="too-many-text"
            >
                {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOO_MANY_ITEMS') }}
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
                {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
            </template>
        </p-data-loader>
        <cost-explorer-set-filter-modal v-model:visible="state.filterModalVisible"
                                        :prev-selected-filters="costAnalysisPageState.filters"
                                        :categories="CATEGORIES"
                                        @confirm="handleUpdateFilters"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-chart-query-section {
    @apply col-span-3 bg-white rounded-md border border-gray-200;
    .title-wrapper {
        @apply border-b border-gray-200;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 2.5rem;
        padding: 0.5rem 1rem;
        .title {
            font-size: 0.875rem;
            font-weight: bold;
        }

        /* custom design-system component - p-select-dropdown */
        :deep(.p-select-dropdown) {
            .dropdown-button {
                font-weight: bold;
            }
        }
        .button-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    }
    .filter-wrapper {
        height: 8rem;
        overflow-y: auto;
        padding: 0.75rem 1rem;
        .p-tag {
            margin-bottom: 0.5rem;
        }
    }
    .legend-wrapper {
        height: 16.75rem;
        overflow-y: auto;
        padding: 0.5rem 0;

        .too-many-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            padding: 0 1rem 0.5rem;
        }
        .legend {
            height: 25px;
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0 1rem;

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

    @define-mixin row-stack {
        @apply col-span-12 row-start-1;
        .legend-wrapper {
            height: auto;
            padding: 0.5rem;
            .legend {
                display: inline-block;
                .p-status {
                    height: 100%;
                }
            }
        }
    }

    @screen tablet {
        @mixin row-stack;
    }
}
</style>
