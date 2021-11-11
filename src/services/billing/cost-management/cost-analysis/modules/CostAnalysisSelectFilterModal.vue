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
                        <template #default="{data, name}">
                            <project-select-dropdown v-if="name === FILTER_ITEM.PROJECT"
                                                     multi-selectable
                                                     @select="handleSelectProject"
                            />
                            <p-search-dropdown
                                v-if="[FILTER_ITEM.SERVICE_ACCOUNT, FILTER_ITEM.REGION, FILTER_ITEM.PROVIDER].includes(name)"
                                class="search-dropdown-item"
                                :menu="data.menuItems"
                                :selected.sync="data.selectedItems"
                                type="checkbox"
                                :show-selected-list="true"
                                use-fixed-menu-style
                            />
                            <p-search-dropdown
                                v-else-if="[FILTER_ITEM.RESOURCE, FILTER_ITEM.PRODUCT, FILTER_ITEM.ACCOUNT, FILTER_ITEM.TYPE].includes(name)"
                                class="search-dropdown-item"
                                type="checkbox"
                                :handler="getMenuHandler(name)"
                                :selected.sync="data.selectedItems"
                                :show-selected-list="true"
                                :loading="menuLoading"
                                use-fixed-menu-style
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTER') }} ({{ selectedFilterItems.length }})
                        </div>
                        <div class="selected-tags-wrapper">
                            <template v-for="(selectedFilterItem, idx) in selectedFilterItems">
                                <p-tag v-for="selectedItem in selectedFilterItem.data.selectedItems"
                                       :key="`selected-tag-${idx}-${selectedItem.name}`"
                                       @delete="handleDeleteTag(selectedFilterItem.name, selectedItem.name)"
                                >
                                    <b>{{ selectedFilterItem.title }}: </b>{{ selectedItem.label }}
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
import { remove } from 'lodash';
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PCollapsibleList, PSearchDropdown, PTag,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { FILTER_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { FilterItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { store } from '@/store';


export default {
    name: 'CostAnalysisSelectFilterModal',
    components: {
        ProjectSelectDropdown,
        PButtonModal,
        PCollapsibleList,
        PSearchDropdown,
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
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            serviceAccountItems: computed<MenuItem[]>(() => Object.keys(state.serviceAccounts).map(k => ({
                name: k, label: state.serviceAccounts[k].label,
            }))),
            providerItems: computed<MenuItem[]>(() => Object.keys(state.providers).map(k => ({
                name: k, label: state.providers[k].label,
            }))),
            regionItems: computed<MenuItem[]>(() => Object.keys(state.regions).map(k => ({
                name: k, label: state.regions[k].name,
            }))),
            //
            proxyVisible: makeProxy('visible', props, emit),
            filterItems: [
                { name: FILTER_ITEM.PROJECT, title: 'Project', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.SERVICE_ACCOUNT, title: 'Service Account', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.PRODUCT, title: 'Product', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.REGION, title: 'Region', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.PROVIDER, title: 'Provider', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.TYPE, title: 'Type', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.RESOURCE, title: 'Resource', data: { menuItems: [], selectedItems: [] } },
                { name: FILTER_ITEM.ACCOUNT, title: 'Account', data: { menuItems: [], selectedItems: [] } },
                // { name: FILTER_ITEM.TAG, title: 'Tag', data: { menuItems: [], selectedItems: [] } },
                // { name: FILTER_ITEM.ADDITIONAL_FIELD, title: 'Additional Field', data: { menuItems: [], selectedItems: [] } },
            ] as FilterItem[],
            selectedFilterItems: computed<FilterItem[]>(() => state.filterItems.filter(d => d.data.selectedItems.length).map(d => ({
                name: d.name,
                title: d.title,
                data: {
                    selectedItems: d.data.selectedItems,
                },
            }))),
            // proxySelectedFilterItems: makeProxy('selectedFilterItems', props, emit),
            unfoldedIndices: [] as number[],
            menuLoading: false,
        });

        /* util */
        const getMenuItems = (filterName) => {
            const filterItem = state.filterItems.find(d => d.name === filterName);
            if (filterName === FILTER_ITEM.SERVICE_ACCOUNT) {
                if (filterItem) filterItem.data.menuItems = state.serviceAccountItems;
            } else if (filterName === FILTER_ITEM.REGION) {
                if (filterItem) filterItem.data.menuItems = state.regionItems;
            } else if (filterName === FILTER_ITEM.PROVIDER) {
                if (filterItem) filterItem.data.menuItems = state.providerItems;
            }
        };

        /* api */
        let resourceToken: CancelTokenSource | undefined;
        const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|void> => {
            if (resourceToken) {
                resourceToken.cancel('Next request has been called.');
                resourceToken = undefined;
            }

            resourceToken = axios.CancelToken.source();

            try {
                state.menuLoading = true;
                const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
                    resource_type: 'cost_analysis.Cost',
                    distinct_key: distinctKey,
                    search: inputText,
                    options: {
                        limit: 10,
                    },
                }, {
                    cancelToken: resourceToken.token,
                });
                resourceToken = undefined;

                return results;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }

                return undefined;
            } finally {
                state.menuLoading = false;
            }
        };
        const getMenuHandler = (filterName) => {
            const distinctKey = filterName.toLowerCase();
            return async (value: string) => {
                const results = await getResources(value, distinctKey);
                return { results: results ? results.map(d => ({ name: d.key, label: d.name })) : [] };
            };
        };

        /* event */
        const handleSelectProject = (selectedProjects) => {
            const projectFilterItem = state.filterItems.find(d => d.name === FILTER_ITEM.PROJECT);
            projectFilterItem.data.selectedItems = selectedProjects.map(d => ({
                name: d.id,
                label: d.name,
            }));
        };
        const handleDeleteTag = (filterName: string, selectedItemName: string) => {
            const filterItem: FilterItem = state.filterItems.find(d => d.name === filterName);
            if (!filterItem) return;

            const results = [...filterItem.data.selectedItems];
            remove(results, d => d.name === selectedItemName);
            filterItem.data.selectedItems = results;
        };
        const handleFormConfirm = () => {
            state.proxyVisible = false;
            emit('confirm');
        };
        const handleClearAll = () => {
            state.filterItems.forEach((d) => {
                d.data.selectedItems = [];
            });
            state.unfoldedIndices = [];
        };

        watch(() => state.unfoldedIndices, (unfoldedIndices) => {
            unfoldedIndices.forEach((idx) => {
                const selectedFilterItem = state.filterItems[idx];
                if (!selectedFilterItem.data.menuItems?.length) {
                    getMenuItems(selectedFilterItem.name);
                }
            });
            // todo: toggle 해제 시 selected Filter 초기화 작업 필
        });

        return {
            ...toRefs(state),
            FILTER_ITEM,
            handleFormConfirm,
            handleClearAll,
            handleSelectProject,
            handleDeleteTag,
            getMenuHandler,
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
