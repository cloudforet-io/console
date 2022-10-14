<template>
    <p-button-modal
        v-if="visible"
        class="cost-explorer-set-filter-modal"
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_FILTER')"
        :visible.sync="proxyVisible"
        :footer-reset-button-visible="true"
        @confirm="handleFormConfirm"
        @return="handleClearAll"
    >
        <template #body>
            <div class="select-filter-body">
                <div class="left-select-filter-section">
                    <p-collapsible-list
                        class="collapsible-list-section"
                        :items="filterCategories"
                        toggle-type="switch"
                        :multi-unfoldable="true"
                        :unfolded-indices.sync="unfoldedIndices"
                    >
                        <template #default="{data, isCollapsed}">
                            <cost-analysis-filter-item
                                v-if="!isCollapsed"
                                :type="data"
                                :selected="selectedFilterItems.filter(d => d.category === data)"
                                @update:selected="handleFilterUpdate(data, $event)"
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTER') }} ({{ selectedFilterItems.length }})
                        </div>
                        <div v-if="selectedFilterItems.length" class="selected-tags-wrapper">
                            <p-tag v-for="(filterItem, idx) in refinedSelectedFilterItems" :key="`selected-tag-${idx}-${filterItem.resourceName}`"
                                   @delete="handleDeleteTag(filterItem)"
                            >
                                <b>[{{ FILTER_ITEM_MAP[filterItem.category].label }}] </b>{{ filterItem.value }}
                            </p-tag>
                        </div>
                        <div v-else class="no-item-wrapper">
                            <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER_MODAL_HELP_TEXT_1') }}</p>
                            <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER_MODAL_HELP_TEXT_2') }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #reset-button>
            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CLEAR_ALL') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PCollapsibleList, PTag,
} from '@spaceone/design-system';
import type { CollapsibleItem } from '@spaceone/design-system/dist/src/data-display/collapsibles/collapsible-list/type';
import { cloneDeep } from 'lodash';

import { store } from '@/store';

import { useProxyValue } from '@/common/composables/proxy-state';

import { getRefinedFilterItems } from '@/services/cost-explorer/cost-analysis/lib/helper';
import CostAnalysisFilterItem from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisFilterItem.vue';
import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import type { CostQueryFilterItem } from '@/services/cost-explorer/type';


interface Props {
    visible: boolean;
    filterCategories: CollapsibleItem[];
    prevFilterItems: CostQueryFilterItem[];
}

export default defineComponent<Props>({
    name: 'CostExplorerSetFilterModal',
    components: {
        CostAnalysisFilterItem,
        PButtonModal,
        PCollapsibleList,
        PTag,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        filterCategories: {
            type: Array,
            default: () => ([]),
        },
        prevFilterItems: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            selectedFilterItems: [] as CostQueryFilterItem[],
            resourceMap: computed(() => ({
                [FILTER.PROJECT]: store.getters['reference/projectItems'],
                [FILTER.PROJECT_GROUP]: store.getters['reference/projectGroupItems'],
                [FILTER.SERVICE_ACCOUNT]: store.getters['reference/serviceAccountItems'],
                [FILTER.PROVIDER]: store.getters['reference/providerItems'],
                [FILTER.REGION]: store.getters['reference/regionItems'],
            })),
            refinedSelectedFilterItems: computed<CostQueryFilterItem[]>(() => getRefinedFilterItems(state.resourceMap, state.selectedFilterItems)),
            unfoldedIndices: [] as number[],
            menuLoading: false,
        });

        /* Util */
        const init = () => {
            const _unfoldedIndices: number[] = [];
            props.filterCategories.forEach((item, idx) => {
                if (props.prevFilterItems?.find(d => d.category === item.data)) {
                    _unfoldedIndices.push(idx);
                }
            });
            state.unfoldedIndices = _unfoldedIndices;
            state.selectedFilterItems = [...props.prevFilterItems];
        };

        /* Event */
        const handleDeleteTag = (filterItem: CostQueryFilterItem) => {
            const _filters = [...state.selectedFilterItems];
            const _index = _filters.findIndex(f => f.resourceName === filterItem.resourceName);
            _filters.splice(_index, 1);
            state.selectedFilterItems = _filters;
        };
        const handleFormConfirm = () => {
            emit('confirm', state.selectedFilterItems);
            state.proxyVisible = false;
        };
        const handleClearAll = () => {
            state.selectedFilterItems = [];
            state.unfoldedIndices = [];
        };
        const handleFilterUpdate = (category: string, selected: CostQueryFilterItem[]) => {
            const _prevFilterItems = cloneDeep(state.selectedFilterItems).filter(item => item.category !== category);
            state.selectedFilterItems = [..._prevFilterItems, ...selected];
        };

        /* Watcher */
        watch(() => props.visible, (after) => {
            if (after) init();
        });

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            FILTER_ITEM_MAP,
            handleFormConfirm,
            handleClearAll,
            handleDeleteTag,
            handleFilterUpdate,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cost-explorer-set-filter-modal {
    /* custom design-system component - p-button-modal */
    :deep(&.p-button-modal) {
        .modal-content {
            height: 48.75rem;
        }
    }
    .select-filter-body {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid grid-cols-1;
        }

        .left-select-filter-section {
            @apply bg-gray-100 border border-solid border-gray-200 rounded;
            padding: 0.5rem;

            /* custom design-system component - p-collapsible-list */
            :deep(.collapsible-list-section) {
                @apply flex flex-wrap flex-col gap-1;
                .collapsible-item {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    > .p-collapsible-panel {
                        > .contents {
                            @apply rounded-lg bg-blue-100;
                            padding: 0.75rem;
                            margin-top: 0.25rem;
                        }
                    }
                }
            }
        }
        .right-select-filter-section {
            @apply flex flex-col flex-wrap gap-4;

            .selected-filter-section {
                @apply rounded-lg border-gray-200 border-solid;
                min-height: 11rem;
                border-width: 1px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: flex-start;
                padding: 1rem;

                .selected-tags-wrapper .p-tag {
                    margin-bottom: 0.5rem;
                }
                .no-item-wrapper {
                    @apply text-gray-300;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }
            }
        }
    }
}
</style>
