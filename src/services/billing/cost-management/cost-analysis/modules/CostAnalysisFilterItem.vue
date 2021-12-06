<template>
    <div>
        <project-select-dropdown v-if="type === FILTER.PROJECT"
                                 multi-selectable
                                 :selected-project-ids="selected"
                                 @update:selectedProjectIds="handleSelectedProjectIds"
        />
        <p-search-dropdown
            v-else-if="type === FILTER.SERVICE_ACCOUNT || type === FILTER.REGION || type === FILTER.PROVIDER"
            :menu="menuItems"
            type="checkbox"
            :selected="selectedItems"
            :show-selected-list="true"
            use-fixed-menu-style
            @update:selected="handleSelectMenuItem"
        />
        <p-search-dropdown
            v-else-if="type === FILTER.RESOURCE || type === FILTER.PRODUCT || type === FILTER.ACCOUNT || type === FILTER.TYPE"
            type="checkbox"
            :handler="menuHandler"
            :selected="selectedItems"
            :show-selected-list="true"
            :loading="menuLoading"
            use-fixed-menu-style
            @update:selected="handleSelectMenuItem"
        />
    </div>
</template>

<script lang="ts">
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PSearchDropdown,
} from '@spaceone/design-system';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import {
    AutocompleteHandler, SearchDropdownMenuItem,
} from '@spaceone/design-system/dist/src/inputs/search/search-dropdown/type';
import { FILTER } from '@/services/billing/cost-management/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';


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
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            menuItems: computed(() => {
                if (props.type === FILTER.SERVICE_ACCOUNT) {
                    return Object.keys(state.serviceAccounts).map(k => ({
                        name: k, label: state.serviceAccounts[k].label,
                    }));
                } if (props.type === FILTER.PROVIDER) {
                    return Object.keys(state.providers).map(k => ({
                        name: k, label: state.providers[k].label,
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
            } catch (e) {
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
        const handleSelectMenuItem = (selectedItems) => {
            emit('update:selected', selectedItems.map(d => d.name));
        };

        return {
            ...toRefs(state),
            FILTER,
            menuHandler,
            handleSelectedProjectIds,
            handleSelectMenuItem,
        };
    },
};
</script>
