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
            :selected="selectedItems"
            multi-selectable
            use-fixed-menu-style
            :exact-mode="false"
            @select-menu="handleSelectMenuItem"
            @search="handleSearch"
        />
        <p-search-dropdown
            v-else
            :handler="menuHandler"
            :selected="selectedItems"
            :loading="menuLoading"
            multi-selectable
            use-fixed-menu-style
            :exact-mode="false"
            @select-menu="handleSelectMenuItem"
            @search="handleSearch"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PSearchDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import {
    AutocompleteHandler, SearchDropdownMenuItem,
} from '@spaceone/design-system/dist/src/inputs/dropdown/search-dropdown/type';
import axios, { CancelTokenSource } from 'axios';


import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';


import { FILTER } from '@/services/cost-explorer/lib/config';


interface Props {
    type: string;
    selected: string[];
}

export default {
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
    setup(props: Props, { emit }) {
        const state = reactive({
            selectedItems: computed<SearchDropdownMenuItem[]>(() => props.selected.map(selectedName => ({
                name: selectedName,
                label: state.menuItems.find(d => d.name === selectedName)?.label || selectedName,
            }))),
            serviceAccounts: computed(() => store.state.reference.serviceAccount.items),
            providers: computed(() => store.state.reference.provider.items),
            regions: computed(() => store.state.reference.region.items),
            menuItems: computed(() => {
                if (props.type === FILTER.SERVICE_ACCOUNT) {
                    return Object.keys(state.serviceAccounts).map(k => ({
                        name: k, label: state.serviceAccounts[k].label,
                    }));
                } if (props.type === FILTER.PROVIDER) {
                    return Object.keys(state.providers).map(k => ({
                        name: k, label: state.providers[k].name,
                    }));
                } if (props.type === FILTER.REGION) {
                    return Object.keys(state.regions).map(k => ({
                        name: k, label: state.regions[k].name,
                    }));
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

            state.menuLoading = true;
            const results = await getResources(value, props.type.toLowerCase());
            state.menuLoading = false;

            return { results: results ? results.map(d => ({ name: d.key, label: d.name })) : [] };
        };

        /* event */
        const handleSelectedProjectIds = (selectedProjectIds) => {
            emit('update:selected', selectedProjectIds);
        };
        const handleSelectMenuItem = (selectedItem: MenuItem) => {
            const selectedNames = [...props.selected];
            const selectedName = selectedItem.name as string;
            if (props.selected?.includes(selectedName)) {
                const idx = props.selected.indexOf(selectedName);
                selectedNames.splice(idx, 1);
            } else {
                selectedNames.push(selectedItem.name as string);
            }
            emit('update:selected', selectedNames);
        };
        const handleSearch = (val: string) => {
            emit('update:selected', state.selectedItems.map(d => d.name).concat([val]));
        };

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
            handleSelectMenuItem,
            handleSearch,
        };
    },
};
</script>
