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
                        <cost-explorer-filter-tags :filter-items="selectedFilterItems"
                                                   @update-filter-tags="handleUpdateFilterTags"
                        >
                            <template #no-filter>
                                <div class="no-item-wrapper">
                                    <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER_MODAL_HELP_TEXT_1') }}</p>
                                    <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER_MODAL_HELP_TEXT_2') }}</p>
                                </div>
                            </template>
                        </cost-explorer-filter-tags>
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
    defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PCollapsibleList,
} from '@spaceone/design-system';
import type { CollapsibleItem } from '@spaceone/design-system/dist/src/data-display/collapsibles/collapsible-list/type';
import { cloneDeep } from 'lodash';

import { useProxyValue } from '@/common/composables/proxy-state';

import CostAnalysisFilterItem from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisFilterItem.vue';
import { FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import CostExplorerFilterTags from '@/services/cost-explorer/modules/CostExplorerFilterTags.vue';
import type { CostQueryFilterItem } from '@/services/cost-explorer/type';


interface Props {
    visible: boolean;
    filterCategories: CollapsibleItem[];
    prevFilterItems: CostQueryFilterItem[];
}

export default defineComponent<Props>({
    name: 'CostExplorerSetFilterModal',
    components: {
        CostExplorerFilterTags,
        CostAnalysisFilterItem,
        PButtonModal,
        PCollapsibleList,
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
        const handleUpdateFilterTags = (filterItems: CostQueryFilterItem[]) => {
            state.selectedFilterItems = filterItems;
        };

        /* Watcher */
        watch(() => props.visible, (after) => {
            if (after) init();
        });

        return {
            ...toRefs(state),
            FILTER_ITEM_MAP,
            handleFormConfirm,
            handleClearAll,
            handleFilterUpdate,
            handleUpdateFilterTags,
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
                @apply rounded-lg border border-gray-200;
                min-height: 11rem;
                padding: 1rem;

                .cost-explorer-filter-tags {
                    height: auto;
                    padding: 1rem 0;
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
