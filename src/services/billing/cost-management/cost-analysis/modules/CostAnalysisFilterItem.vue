<template>
    <div>
        <project-select-dropdown v-if="type === FILTER_MAP.PROJECT.name"
                                 :selected-project-ids="proxySelected.map(d => d.name)"
                                 multi-selectable
                                 @select="handleSelectProject"
        />
        <p-search-dropdown
            v-else-if="type === FILTER_MAP.SERVICE_ACCOUNT.name || type === FILTER_MAP.REGION.name || type === FILTER_MAP.PROVIDER.name"
            :menu="menuItems"
            :selected.sync="proxySelected"
            type="checkbox"
            :show-selected-list="true"
            use-fixed-menu-style
        />
        <p-search-dropdown
            v-else-if="type === FILTER_MAP.RESOURCE.name || type === FILTER_MAP.PRODUCT.name || type === FILTER_MAP.ACCOUNT.name || type === FILTER_MAP.TYPE.name"
            type="checkbox"
            :handler="menuHandler"
            :selected.sync="proxySelected"
            :show-selected-list="true"
            :loading="menuLoading"
            use-fixed-menu-style
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

import { AutocompleteHandler } from '@spaceone/design-system/dist/src/inputs/search/search-dropdown/type';
import { FILTER_MAP } from '@/services/billing/cost-management/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { makeProxy } from '@/lib/helper/composition-helpers';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';


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
    setup(props, { emit }) {
        const state = reactive({
            proxySelected: makeProxy('selected', props, emit),
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            menuItems: computed(() => {
                if (props.type === FILTER_MAP.SERVICE_ACCOUNT.name) {
                    return Object.keys(state.serviceAccounts).map(k => ({
                        name: k, label: state.serviceAccounts[k].label,
                    }));
                } if (props.type === FILTER_MAP.PROVIDER.name) {
                    return Object.keys(state.providers).map(k => ({
                        name: k, label: state.providers[k].label,
                    }));
                } if (props.type === FILTER_MAP.REGION.name) {
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
        const handleSelectProject = (selectedProjects) => {
            state.proxySelected = selectedProjects.map(d => ({
                name: d.id,
                label: d.name,
            }));
        };

        return {
            ...toRefs(state),
            FILTER_MAP,
            handleSelectProject,
            menuHandler,
        };
    },
};
</script>
