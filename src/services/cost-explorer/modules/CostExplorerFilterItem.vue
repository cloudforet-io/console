<template>
    <div class="cost-explorer-filter-item">
        <project-select-dropdown v-if="category === FILTER.PROJECT"
                                 multi-selectable
                                 project-selectable
                                 :selected-project-ids="selectedItems.map(d => d.name)"
                                 @update:selected-project-ids="handleSelectedProjectIds"
        />
        <project-select-dropdown v-else-if="category === FILTER.PROJECT_GROUP"
                                 multi-selectable
                                 project-group-selectable
                                 :selected-project-ids="selectedItems.map(d => d.name)"
                                 @update:selected-project-ids="handleSelectedProjectIds"
        />
        <p-filterable-dropdown
            v-else-if="category === FILTER.SERVICE_ACCOUNT || category === FILTER.REGION || category === FILTER.PROVIDER"
            :menu="menuItems"
            :selected="selectedItems"
            multi-selectable
            use-fixed-menu-style
            appearance-type="stack"
            show-select-marker
            @update:selected="handleUpdateSelected"
        />
        <p-query-input
            v-else-if="category === FILTER.TAGS || category === FILTER.ADDITIONAL_INFO"
            class="filterable-query-dropdown"
            :key-item-sets="querySearchHandlerState.keyItemSets"
            :value-handler-map="querySearchHandlerState.valueHandlerMap"
            :selected="querySearchHandlerState.selectedQueryItems"
            use-fixed-menu-style
            multi-input
            block
            appearance-type="stack"
            @update:selected="handleUpdateSelectedQueryItems"
        />
        <p-filterable-dropdown
            v-else
            :handler="menuHandler"
            :selected="selectedItems"
            :loading="menuLoading"
            multi-selectable
            use-fixed-menu-style
            appearance-type="stack"
            show-select-marker
            @update:selected="handleUpdateSelected"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PQueryInput,
    PFilterableDropdown,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler, FilterableDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, QueryItem } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { QueryItemResource } from '@/services/cost-explorer/cost-analysis/type';
import { FILTER } from '@/services/cost-explorer/lib/config';
import type { FilterItem } from '@/services/cost-explorer/type';

interface Props {
    category: string;
    selectedFilterItems: FilterItem[];
}

export default {
    name: 'CostExplorerFilterItem',
    components: {
        PQueryInput,
        ProjectSelectDropdown,
        PFilterableDropdown,
    },
    props: {
        category: {
            type: String,
            default: undefined,
        },
        selectedFilterItems: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props: Props, { emit }) {
        const storeState = reactive({
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
        });
        const state = reactive({
            selectedItems: computed<FilterableDropdownMenuItem[]>(() => props.selectedFilterItems?.map((filterItem) => ({
                name: filterItem.v,
                label: state.menuItems.find((d) => d.name === filterItem.v)?.label || filterItem.v,
            }))),
            menuItems: computed(() => {
                if (props.category === FILTER.SERVICE_ACCOUNT) {
                    return Object.keys(storeState.serviceAccounts).map((k) => ({
                        name: k, label: storeState.serviceAccounts[k].label,
                    }));
                } if (props.category === FILTER.PROVIDER) {
                    return Object.keys(storeState.providers).map((k) => ({
                        name: k, label: storeState.providers[k].name,
                    }));
                } if (props.category === FILTER.REGION) {
                    return Object.keys(storeState.regions).map((k) => ({
                        name: k, label: storeState.regions[k].name,
                    }));
                }
                return [];
            }),
            menuLoading: false,
        });
        const querySearchHandlerState = reactive({
            querySearchResource: undefined as QueryItemResource[] | undefined,
            selectedQueryItems: computed<QueryItem[]>(() => props.selectedFilterItems?.map((filterItem) => ({
                key: {
                    label: filterItem.k.replaceAll(`${props.category}.`, ''),
                    name: filterItem.k.replaceAll(`${props.category}.`, ''),
                },
                value: {
                    label: filterItem.v,
                    name: filterItem.v,
                },
            }))),
            keyItemSets: computed<KeyItemSet[]>(() => {
                if (querySearchHandlerState.querySearchResource) {
                    return queryItemFormatter(querySearchHandlerState.querySearchResource, props.category);
                }
                return [];
            }),
            valueHandlerMap: computed(() => {
                const result = {};
                querySearchHandlerState.keyItemSets.forEach(({ items }) => {
                    items.forEach(({ name }) => {
                        result[name] = makeDistinctValueHandler('cost_analysis.Cost', `${props.category}.${name}`);
                    });
                });
                return result;
            }),
        });

        /* api */
        let resourceToken: CancelTokenSource | undefined;
        const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|void> => {
            if (resourceToken) {
                resourceToken.cancel('Next request has been called.');
                resourceToken = undefined;
            }

            resourceToken = axios.CancelToken.source();

            try {
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
            } catch (e: any) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }

                return undefined;
            }
        };
        const menuHandler: AutocompleteHandler = async (value: string) => {
            if (!props.category) return { results: [] };

            state.menuLoading = true;
            const results = await getResources(value, props.category);
            state.menuLoading = false;

            return { results: results ? results.map((d) => ({ name: d.key, label: d.name })) : [] };
        };

        const queryItemFormatter = (data: QueryItemResource[], distinct: string) => {
            const result: {name: string; label: string}[] = data.map((item) => ({
                name: item.name || item.key,
                label: item.name || item.key,
            }));

            return [
                {
                    title: distinct,
                    items: result,
                },
            ];
        };

        /* event */
        const handleSelectedProjectIds = (selectedProjectIds) => {
            const updatedFilterItems = selectedProjectIds.map((d) => ({
                k: props.category,
                v: d,
                o: '=',
            }));
            emit('update-filter-items', updatedFilterItems);
        };
        const handleUpdateSelected = (selectedItems: FilterableDropdownMenuItem[]) => {
            const updatedFilterItems = selectedItems.map((d) => ({
                k: props.category,
                v: d.name,
                o: '=',
            }));
            emit('update-filter-items', updatedFilterItems);
        };
        const handleUpdateSelectedQueryItems = (selectedQueryItems: QueryItem[]) => {
            const updatedFilterItems = selectedQueryItems.map((d) => ({
                k: `${props.category}.${d.key?.label}`,
                v: d.value.label,
                o: '=',
            }));
            emit('update-filter-items', updatedFilterItems);
        };

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
            ]);
        })();

        // LOAD QUERY SEARCH DROPDOWN DATA
        (async () => {
            if (props.category === FILTER.ADDITIONAL_INFO || props.category === FILTER.TAGS) {
                const result = await getResources('', props.category);
                if (result) querySearchHandlerState.querySearchResource = result;
            }
        })();

        return {
            ...toRefs(state),
            querySearchHandlerState,
            FILTER,
            menuHandler,
            handleSelectedProjectIds,
            handleUpdateSelected,
            handleUpdateSelectedQueryItems,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-explorer-filter-item {
    /* custom p-filterable-query-dropdown */
    :deep(.filterable-query-dropdown) {
        .input-wrapper {
            word-break: initial;
        }
    }
}
</style>
