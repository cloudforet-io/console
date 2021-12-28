<template>
    <p-button-modal
        v-if="visible"
        class="set-filter-modal"
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
                        :items="filterItems"
                        toggle-type="switch"
                        :multi-unfoldable="true"
                        :unfolded-indices.sync="unfoldedIndices"
                    >
                        <template #default="{name, isCollapsed}">
                            <cost-analysis-filter-item
                                v-if="!isCollapsed"
                                :type="name"
                                :selected.sync="filters[name]"
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTER') }} ({{ selectedItemsLength }})
                        </div>
                        <div v-if="selectedItemsLength" class="selected-tags-wrapper">
                            <template v-for="([filterName, items], idx) in Object.entries(selectedItemsMap)">
                                <p-tag v-for="(item, itemIdx) in items" :key="`selected-tag-${idx}-${item.name}`"
                                       @delete="handleDeleteTag(filterName, itemIdx)"
                                >
                                    <b>{{ FILTER_ITEM_MAP[filterName].label }}: </b>{{ item.label }}
                                </p-tag>
                            </template>
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
import { sum } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PCollapsibleList, PTag,
} from '@spaceone/design-system';

import CostAnalysisFilterItem from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisFilterItem.vue';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { FILTER_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilterItemsMap, CostQueryFilters } from '@/services/billing/cost-management/type';
import { ResourceItem } from '@/store/modules/resource/type';
import { store } from '@/store';


interface FilterItem {
    name: string;
    title: string;
}

interface Props {
    visible: boolean;
    filterItems: FilterItem[];
    selectedFilters: CostQueryFilters;
}

export default {
    name: 'SetFilterModal',
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
        filterItems: {
            type: Array,
            default: () => ([]),
        },
        selectedFilters: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            filters: {} as CostQueryFilters,
            selectedItemsMap: computed<CostQueryFilterItemsMap>(() => {
                const itemsMap: CostQueryFilterItemsMap = {};
                const resourceItemsMap = {
                    project_id: store.state.resource.project.items,
                    service_account_id: store.state.resource.serviceAccount.items,
                    provider: store.state.resource.provider.items,
                    region_code: store.state.resource.region.items,
                };

                Object.entries(state.filters as CostQueryFilters).forEach(([key, data]) => {
                    const resourceItems = resourceItemsMap[key];
                    if (resourceItems) {
                        itemsMap[key] = data?.map((d) => {
                            const resourceItem: ResourceItem = resourceItems[d];
                            const label = key === 'region_code' ? resourceItem?.name : resourceItem?.label;
                            return { name: d, label: label ?? d };
                        });
                    } else itemsMap[key] = data?.map(d => ({ name: d, label: d }));
                });
                return itemsMap;
            }),
            selectedItemsLength: computed<number>(() => {
                const selectedValues = Object.values(state.selectedItemsMap);
                return sum(selectedValues.map(v => v?.length || 0));
            }),
            unfoldedIndices: [] as number[],
            menuLoading: false,
        });

        /* util */
        const init = () => {
            const _unfoldedIndices: number[] = [];
            props.filterItems.forEach((item, idx) => {
                if (props.selectedFilters[item.name]?.length) {
                    _unfoldedIndices.push(idx);
                }
            });
            state.unfoldedIndices = _unfoldedIndices;
            state.filters = { ...props.selectedFilters };
        };

        /* event */
        const handleDeleteTag = (filterName: string, itemIdx: number) => {
            const _filters = { ...state.filters };
            const _filterItems = [..._filters[filterName]];
            _filterItems.splice(itemIdx, 1);
            if (_filterItems.length) {
                _filters[filterName] = _filterItems;
            } else {
                _filters[filterName] = undefined;
            }
            state.filters = _filters;
        };
        const handleFormConfirm = () => {
            store.commit('service/costAnalysis/setFilters', state.filters);
            state.proxyVisible = false;
        };
        const handleClearAll = () => {
            state.filters = {};
            state.unfoldedIndices = [];
        };

        watch(() => state.unfoldedIndices, (after, before) => {
            if (after.length < before.length) {
                const _filters = { ...state.filters };
                const deletedIndex: number = before.filter(idx => !after.includes(idx))[0];
                const deletedFilterName = props.filterItems[deletedIndex].name;
                _filters[deletedFilterName] = undefined;
                state.filters = _filters;
            }
        });
        watch(() => props.visible, (after) => {
            if (after) init();
        });

        return {
            ...toRefs(state),
            FILTER_ITEM_MAP,
            handleFormConfirm,
            handleClearAll,
            handleDeleteTag,
        };
    },
};
</script>

<style lang="postcss" scoped>
.set-filter-modal {
    &.p-button-modal::v-deep {
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
            .collapsible-list-section {
                @apply flex flex-wrap flex-col gap-1;
                ::v-deep .collapsible-item {
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
