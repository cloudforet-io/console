<template>
    <div>
        <project-select-dropdown v-if="type === FILTER.PROJECT"
                                 multi-selectable
                                 project-selectable
                                 :selected-project-ids="selected"
                                 @update:selectedProjectIds="handleSelectedProjectIds"
        />
        <project-select-dropdown v-else-if="type === FILTER.PROJECT_GROUP"
                                 multi-selectable
                                 project-group-selectable
                                 :selected-project-ids="selected"
                                 @update:selectedProjectIds="handleSelectedProjectIds"
        />
        <p-search-dropdown
            v-else-if="type === FILTER.SERVICE_ACCOUNT || type === FILTER.REGION || type === FILTER.PROVIDER"
            :menu="menuItems"
            :selected="selectedSearchDropdownItems"
            :exact-mode="false"
            multi-selectable
            use-fixed-menu-style
            @update:selected="handleUpdateSelected"
        />
        <p-query-search-dropdown
            v-else-if="type === FILTER.TAGS || type === FILTER.ADDITIONAL_INFO"
            :key-item-sets="querySearchHandlerState.keyItemSets"
            :value-handler-map="querySearchHandlerState.valueHandlerMap"
            :selected.sync="querySearchHandlerState.selectedQueryItems"
            multi-selectable
            @update:selected="handleUpdateSelectedQueryItems"
        />
        <p-search-dropdown
            v-else
            :handler="menuHandler"
            :selected="selectedSearchDropdownItems"
            :loading="menuLoading"
            multi-selectable
            use-fixed-menu-style
            :exact-mode="false"
            @update:selected="handleUpdateSelected"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PQuerySearchDropdown,
    PSearchDropdown,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler, SearchDropdownMenuItem,
} from '@spaceone/design-system/dist/src/inputs/dropdown/search-dropdown/type';
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
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { FILTER } from '@/services/cost-explorer/lib/config';
import type { CostQueryFilterItem } from '@/services/cost-explorer/type';

interface Props {
    type: string;
    selected: CostQueryFilterItem[];
}

export default defineComponent<Props>({
    name: 'CostAnalysisFilterItem',
    components: {
        PQuerySearchDropdown,
        ProjectSelectDropdown,
        PSearchDropdown,
    },
    props: {
        type: {
            type: String,
            default: undefined,
        },
        selected: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const storeState = reactive({
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
        });
        const state = reactive({
            proxySelected: useProxyValue('selected', props, emit),
            selectedSearchDropdownItems: computed<SearchDropdownMenuItem[]>(() => state.proxySelected?.map(d => ({
                name: d.value,
                label: state.menuItems.find(menuItem => menuItem.name === d.value)?.label || d.value,
            }))),
            menuItems: computed<SearchDropdownMenuItem[]>(() => {
                if (props.type === FILTER.SERVICE_ACCOUNT) {
                    return Object.keys(storeState.serviceAccounts).map(k => ({
                        name: k, label: storeState.serviceAccounts[k].label,
                    }));
                } if (props.type === FILTER.PROVIDER) {
                    return Object.keys(storeState.providers).map(k => ({
                        name: k, label: storeState.providers[k].name,
                    }));
                } if (props.type === FILTER.REGION) {
                    return Object.keys(storeState.regions).map(k => ({
                        name: k, label: storeState.regions[k].name,
                    }));
                }
                return [];
            }),
            menuLoading: false,
        });
        const querySearchHandlerState = reactive({
            querySearchResource: undefined,
            selectedQueryItems: computed<QueryItem[]>(() => state.proxySelected?.map(d => ({
                key: {
                    label: d.key,
                    name: d.key,
                },
                value: {
                    label: d.value,
                    name: d.value,
                },
            }))),
            keyItemSets: computed<KeyItemSet[]>(() => {
                if (querySearchHandlerState.querySearchResource) {
                    return queryItemFormatter(querySearchHandlerState.querySearchResource, props.type);
                }
                return [];
            }),
            valueHandlerMap: computed(() => {
                const result = {};
                querySearchHandlerState.keyItemSets.forEach(({ items }) => {
                    items.forEach(({ name }) => {
                        result[name] = makeDistinctValueHandler('cost_analysis.Cost', `${props.type}.${name}`);
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
            if (!props.type) return { results: [] };

            state.menuLoading = true;
            const results = await getResources(value, props.type);
            state.menuLoading = false;

            return { results: results ? results.map(d => ({ name: d.key, label: d.name })) : [] };
        };

        const queryItemFormatter = (data: {name: string; key: string}[], distinct: string) => {
            const result: {name: string; label: string}[] = data.map(item => ({
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
            state.proxySelected = selectedProjectIds.map(d => ({
                category: props.type,
                value: d,
            }));
        };
        const handleUpdateSelected = (selectedItems: SearchDropdownMenuItem[]) => {
            state.proxySelected = selectedItems.map(d => ({
                category: props.type,
                value: d.name,
            }));
        };

        const handleUpdateSelectedQueryItems = (selectedQueryItems: QueryItem[]) => {
            state.proxySelected = selectedQueryItems.map(d => ({
                category: props.type,
                value: d.value.label || d.value.name,
                key: d.key?.label || d.key?.name,
            }));
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
            if (props.type === FILTER.ADDITIONAL_INFO || props.type === FILTER.TAGS) {
                const result = await getResources('', props.type);
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
});
</script>
