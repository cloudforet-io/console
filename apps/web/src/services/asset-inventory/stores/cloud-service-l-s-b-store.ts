import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


import { CLOUD_SERVICE_GLOBAL_FILTER_KEY } from '@/services/asset-inventory/constants/cloud-service-constant';
import type { CloudServiceGlobalFilterMap } from '@/services/asset-inventory/types/cloud-service-page-type';

export const useCloudServiceLSBStore = defineStore('cloud-service-l-s-b', {
    state: () => ({
        globalFilters: {
            [CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT]: [],
            [CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT]: [],
        } as CloudServiceGlobalFilterMap,
    }),
    getters: {
        selectedProjects: (state): string[] => state.globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT] ?? [],
        selectedServiceAccounts: (state): string[] => state.globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT] ?? [],
        allFilters(): ConsoleFilter[] {
            const filters: ConsoleFilter[] = [
            ];
            if (this.selectedProjects.length) {
                filters.push({ k: CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT, v: this.selectedProjects, o: '=' });
            }
            if (this.selectedServiceAccounts.length) {
                filters.push({ k: `collection_info.${CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT}`, v: this.selectedServiceAccounts, o: '=' });
            }
            return filters;
        },
    },
    actions: {
        setSelectedProjectsToFilters(projects: string[] = []) {
            const _globalFilters = { ...this.globalFilters };
            _globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT] = projects;
            this.globalFilters = _globalFilters;
        },
        setSelectedServiceAccountsToFilters(serviceAccounts: string[] = []) {
            const _globalFilters = { ...this.globalFilters };
            _globalFilters[CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT] = serviceAccounts;
            this.globalFilters = _globalFilters;
        },
    },
});
