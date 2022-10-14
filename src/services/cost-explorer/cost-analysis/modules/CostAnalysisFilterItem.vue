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
            multi-selectable
            use-fixed-menu-style
            :exact-mode="false"
            @update:selected="handleUpdateSelected"
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
    PSearchDropdown,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler, SearchDropdownMenuItem,
} from '@spaceone/design-system/dist/src/inputs/dropdown/search-dropdown/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { ADDITIONAL_FILTER, FILTER } from '@/services/cost-explorer/lib/config';
import type { CostQueryFilterItem } from '@/services/cost-explorer/type';


interface Props {
    type: string;
    selected: CostQueryFilterItem[];
}

export default defineComponent<Props>({
    name: 'CostAnalysisFilterItem',
    components: {
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
                // TODO: tags, additional_info
                if (props.type === ADDITIONAL_FILTER.TAGS) {
                    // return [
                    //     {
                    //         keyItem: { name: 'tag_key1', label: 'tag_key1' },
                    //         valueItem: { name: 'tag_value1', label: 'tag_value1' },
                    //     },
                    //     {
                    //         keyItem: { name: 'tag_key2', label: 'tag_key2' },
                    //         valueItem: { name: 'tag_value2', label: 'tag_value2' },
                    //     },
                    // ];
                }
                return [];
            }),
            menuLoading: false,
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

            // TODO: additional_info, tags
            if (['additional_info', 'tags'].includes(props.type)) return { results: [] };

            state.menuLoading = true;
            const results = await getResources(value, props.type);
            state.menuLoading = false;

            return { results: results ? results.map(d => ({ name: d.key, label: d.name })) : [] };
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
        // const handleSearch = (val: string) => {
        //     emit('update:selected', state.selectedItems.map(d => d.name).concat([val]));
        // };

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            FILTER,
            menuHandler,
            handleSelectedProjectIds,
            handleUpdateSelected,
        };
    },
});
</script>
