import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


import { CLOUD_SERVICE_GLOBAL_FILTER_KEY } from '@/services/asset-inventory/constants/cloud-service-constant';
import type { CloudServiceGlobalFilterMap } from '@/services/asset-inventory/types/cloud-service-page-type';

export const useCloudServiceLSBStore = defineStore('cloud-service-l-s-b', () => {
    const state = reactive({
        globalFilters: {
            [CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT]: [],
            [CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT]: [],
        } as CloudServiceGlobalFilterMap,
    });

    const getters = reactive({
        selectedProjects: computed((): string[] => state.globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT] ?? []),
        selectedServiceAccounts: computed((): string[] => state.globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT] ?? []),
        allFilters: computed<ConsoleFilter[]>(() => {
            const filters: ConsoleFilter[] = [
            ];
            if (getters.selectedProjects.length) {
                filters.push({ k: CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT, v: getters.selectedProjects, o: '=' });
            }
            if (getters.selectedServiceAccounts.length) {
                filters.push({ k: `collection_info.${CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT}`, v: getters.selectedServiceAccounts, o: '=' });
            }
            return filters;
        }),
    });

    const mutations = {
        setGloablFilters(globalFilters: CloudServiceGlobalFilterMap) {
            state.globalFilters = globalFilters;
        },
    };

    const actions = {
        init() {
            state.globalFilters = {};
        },
        setSelectedProjectsToFilters(projects: string[] = []) {
            const _globalFilters = { ...state.globalFilters };
            _globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT] = projects;
            state.globalFilters = _globalFilters;
        },
        setSelectedServiceAccountsToFilters(serviceAccounts: string[] = []) {
            const _globalFilters = { ...state.globalFilters };
            _globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT] = serviceAccounts;
            state.globalFilters = _globalFilters;
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
