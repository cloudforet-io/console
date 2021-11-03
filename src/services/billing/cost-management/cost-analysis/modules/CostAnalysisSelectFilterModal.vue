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
                        <template #default="{data}">
                            <p-search-dropdown
                                class="search-dropdown-item"
                                :menu="data.menuItems"
                                :selected.sync="data.selectedItems"
                                type="checkbox"
                                :show-selected-list="true"
                                use-fixed-menu-style
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="more-filter-wrapper">
                        <div class="more-filter-content">
                            <p class="top-wrapper">
                                <span class="title">
                                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MORE_FILTERS') }}
                                </span>
                                <p-collapsible-toggle :is-collapsed="!moreFilterIsCollapsed"
                                                      toggle-type="switch"
                                                      @update:isCollapsed="handleUpdateCollapsed"
                                />
                            </p>
                            <p-collapsible-panel v-show="moreFilterIsCollapsed"
                                                 :is-collapsed="moreFilterIsCollapsed"
                                                 @update:isCollapsed="handleUpdateCollapsed"
                            >
                                <!--                                <p-autocomplete-search-->
                                <!--                                    class="search-dropdown"-->
                                <!--                                    :menu="filterMenuState.moreFilter.filterItems"-->
                                <!--                                    :selected="filterMenuState.moreFilter.selectedItems"-->
                                <!--                                    type="checkbox"-->
                                <!--                                    :show-selected-list="true"-->
                                <!--                                    use-fixed-menu-style-->
                                <!--                                />-->
                            </p-collapsible-panel>
                        </div>
                    </div>
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTER') }} ({{ selectedFilterTags.length }})
                        </div>
                        <div class="selected-tags-wrapper">
                            <p-tag v-for="(tag, idx) in selectedFilterTags" :key="`selected-tag-${idx}`" @delete="handleDeleteSelectedTag">
                                {{ tag.label }}
                            </p-tag>
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
import { flatten } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal,
    PCollapsibleList,
    PSearchDropdown,
    PCollapsibleToggle,
    PCollapsiblePanel,
    // PAutocompleteSearch,
    PTag,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { GROUP_BY_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { store } from '@/store';


const FILTER_ITEM = Object.freeze({
    ...GROUP_BY_ITEM,
    TAG: 'tag',
});
type FILTER_ITEM = typeof FILTER_ITEM[keyof typeof FILTER_ITEM]

interface FilterData {
    menuItems: MenuItem[];
    selectedItems: MenuItem[];
}

interface FilterItem {
    name: FILTER_ITEM;
    title: string;
    data: FilterData;
}

export default {
    name: 'CostAnalysisSelectFilterModal',
    components: {
        PButtonModal,
        PCollapsibleList,
        PSearchDropdown,
        PCollapsibleToggle,
        PCollapsiblePanel,
        // PAutocompleteSearch,
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
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            //
            proxyVisible: makeProxy('visible', props, emit),
            moreFilterIsCollapsed: false,
            selectedFilterTags: computed<MenuItem[]>(() => flatten(state.filterItems.map(d => d.data.selectedItems))),
            filterItems: [
                { name: FILTER_ITEM.PROJECT, title: 'Project', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.SERVICE_ACCOUNT, title: 'Service Account', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.PRODUCT, title: 'Product', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.REGION, title: 'Region', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.PROVIDER, title: 'Provider', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.TYPE, title: 'Type', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.RESOURCE_ID, title: 'Resource ID', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.CURRENCY, title: 'Currency', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.ACCOUNT, title: 'Account', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.TAG, title: 'Tag', data: { menuItems: [], selectedItems: [] } },
            ] as FilterItem[],
            unfoldedIndices: [] as number[],
        });

        const handleFormConfirm = () => {
            state.proxyVisible = false;
            emit('confirm');
        };

        const handleClearAll = () => {
            console.log('Clear All');
        };

        const handleUpdateCollapsed = () => {
            state.moreFilterIsCollapsed = !state.moreFilterIsCollapsed;
            console.log('switch on/off');
        };

        const handleDeleteSelectedTag = () => {
            console.log('delete tag');
        };

        const getMenuItems = (filterName) => {
            if (filterName === FILTER_ITEM.SERVICE_ACCOUNT) {
                const filterItem = state.filterItems.find(d => d.name === FILTER_ITEM.SERVICE_ACCOUNT);
                if (filterItem) filterItem.data.menuItems = Object.values(state.serviceAccounts);
            }
        };

        watch(() => state.unfoldedIndices, (unfoldedIndices) => {
            unfoldedIndices.forEach((idx) => {
                const selectedFilterItem = state.filterItems[idx];
                if (!selectedFilterItem.data.menuItems.length) {
                    getMenuItems(selectedFilterItem.name);
                }
            });
        });

        return {
            ...toRefs(state),
            handleFormConfirm,
            handleClearAll,
            handleUpdateCollapsed,
            handleDeleteSelectedTag,
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
                >>> .collapsible-item {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    > .p-collapsible-panel {
                        > .contents {
                            @apply rounded-lg bg-blue-100;
                            padding: 0.75rem;
                            margin-top: 0.25rem;
                            .p-tag {
                                margin-bottom: 0;
                            }
                        }
                    }
                }
            }
        }
        .right-select-filter-section {
            @apply flex flex-col flex-wrap gap-4;
            .more-filter-wrapper {
                @apply bg-gray-100 border border-solid border-gray-200 rounded-lg;
                padding: 0.5rem;
                .more-filter-content {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    overflow: auto;
                    .top-wrapper {
                        display: flex;
                        justify-content: space-between;
                        padding: 0.5rem 0;
                        .title {
                            line-height: 1.25;
                        }
                    }
                    >>> .p-collapsible-panel {
                        @apply bg-blue-100 rounded-lg;
                        padding: 0.75rem;
                        margin-top: 0.25rem;
                        margin-bottom: 1rem;
                    }
                }
            }

            .selected-filter-section {
                min-height: 11rem;
                border: 1px solid #e5e5e8;
                box-sizing: border-box;
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: flex-start;
                padding: 1rem;
            }
        }
    }
}
</style>
