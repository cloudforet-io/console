<template>
    <p-button-modal
        v-if="visible"
        class="select-filter-modal-container"
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECT_FILTER')"
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
                            <keep-alive>
                                <cost-analysis-filter-item
                                    v-if="!isCollapsed"
                                    :type="name"
                                    :selected.sync="selectedItemsMap[name]"
                                />
                            </keep-alive>
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTER') }} ({{ selectedItemsLength }})
                        </div>
                        <div class="selected-tags-wrapper">
                            <template v-for="([filterName, selectedItems], idx) in Object.entries(selectedItemsMap)">
                                <p-tag v-for="(item, itemIdx) in selectedItems" :key="`selected-tag-${idx}-${item.name}`"
                                       @delete="handleDeleteTag(filterName, itemIdx)"
                                >
                                    <b>{{ filterItems.find(d => d.name === filterName).title }}: </b>{{ item.label }}
                                </p-tag>
                            </template>
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
import { sum, cloneDeep } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PCollapsibleList, PTag,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import CostAnalysisFilterItem from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisFilterItem.vue';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { FILTER_MAP } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { store } from '@/store';


export default {
    name: 'CostAnalysisSelectFilterModal',
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
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            filters: computed(() => store.state.service.costAnalysis.filters),
            filterItems: computed(() => Object.values(FILTER_MAP).map(item => ({
                name: item.name,
                title: item.label,
            }))),
            selectedItemsMap: {} as Record<string, MenuItem[]>,
            selectedItemsLength: computed<number>(() => {
                const selectedValues = Object.values(state.selectedItemsMap);
                return sum(selectedValues.map(v => v.length));
            }),
            unfoldedIndices: [] as number[],
            menuLoading: false,
        });

        /* util */
        const init = () => {
            const unfoldedIndices: number[] = [];
            state.selectedItemsMap = cloneDeep(state.filters);
            state.filterItems.forEach((item, idx) => {
                if (Object.keys(state.filters).includes(item.name)) {
                    unfoldedIndices.push(idx);
                }
            });
            state.unfoldedIndices = unfoldedIndices;
        };

        /* event */
        const handleDeleteTag = (filterName: string, itemIdx: number) => {
            const _selectedItemsMap = cloneDeep(state.selectedItemsMap);
            const _selectedItems = [..._selectedItemsMap[filterName]];
            _selectedItems.splice(itemIdx, 1);
            if (_selectedItems.length) {
                _selectedItemsMap[filterName] = _selectedItems;
            } else {
                delete _selectedItemsMap[filterName];
            }
            state.selectedItemsMap = _selectedItemsMap;
        };
        const handleFormConfirm = () => {
            state.proxyVisible = false;
            store.commit('service/costAnalysis/setFilters', state.selectedItemsMap);
        };
        const handleClearAll = () => {
            state.selectedItemsMap = {};
            state.unfoldedIndices = [];
        };

        watch(() => state.unfoldedIndices, (after, before) => {
            if (after.length < before.length) {
                const _selectedItemsMap = cloneDeep(state.selectedItemsMap);
                const deletedIndex: number = before.filter(idx => !after.includes(idx))[0];
                const deletedFilterName = state.filterItems[deletedIndex].name;
                delete _selectedItemsMap[deletedFilterName];
                state.selectedItemsMap = _selectedItemsMap;
            }
        });
        watch(() => props.visible, (after) => {
            if (after) init();
        });

        return {
            ...toRefs(state),
            handleFormConfirm,
            handleClearAll,
            handleDeleteTag,
        };
    },
};
</script>

<style lang="postcss" scoped>
.select-filter-modal-container {
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
            }
        }
    }
}
</style>
