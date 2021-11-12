<template>
    <p-button-modal
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
                                    :selected.sync="selectedMap[name]"
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
                            <template v-for="([filterName, selectedItems], idx) in Object.entries(selectedMap)">
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
import { sum } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PCollapsibleList, PTag,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import CostAnalysisFilterItem from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisFilterItem.vue';
import { CollapsibleItem } from '@spaceone/design-system/dist/src/data-display/collapsibles/collapsible-list/type';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { FILTER_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';


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
        // selectedFilterItems: {
        //     type: Object,
        //     default: () => ({}),
        // },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            filterItems: [
                { name: FILTER_ITEM.PROJECT, title: 'Project' },
                { name: FILTER_ITEM.SERVICE_ACCOUNT, title: 'Service Account' },
                { name: FILTER_ITEM.PRODUCT, title: 'Product' },
                { name: FILTER_ITEM.REGION, title: 'Region' },
                { name: FILTER_ITEM.PROVIDER, title: 'Provider' },
                { name: FILTER_ITEM.TYPE, title: 'Type' },
                { name: FILTER_ITEM.RESOURCE, title: 'Resource' },
                { name: FILTER_ITEM.ACCOUNT, title: 'Account' },
                { name: FILTER_ITEM.TAG, title: 'Tag' },
                { name: FILTER_ITEM.ADDITIONAL_FIELD, title: 'Additional Field' },
            ] as CollapsibleItem[],
            selectedMap: {} as Record<FILTER_ITEM, MenuItem[]>,
            selectedItemsLength: computed<number>(() => {
                const selectedValues = Object.values(state.selectedMap);
                return sum(selectedValues.map(v => v.length));
            }),
            unfoldedIndices: [] as number[],
            menuLoading: false,
        });

        /* event */
        const handleDeleteTag = (filterName: string, itemIdx: number) => {
            const selectedItems = [...state.selectedMap[filterName]];
            selectedItems.splice(itemIdx, 1);
            state.selectedMap[filterName] = selectedItems;
        };
        const handleFormConfirm = () => {
            state.proxyVisible = false;
            emit('confirm');
        };
        const handleClearAll = () => {
            state.selectedMap = {};
            state.unfoldedIndices = [];
        };

        watch(() => state.unfoldedIndices, (after, before) => {
            if (after.length < before.length) {
                const deletedIndex: number = before.filter(idx => !after.includes(idx))[0];
                const deletedFilterName = state.filterItems[deletedIndex].name;
                state.selectedMap[deletedFilterName] = [];
            }
        });

        return {
            ...toRefs(state),
            FILTER_ITEM,
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
