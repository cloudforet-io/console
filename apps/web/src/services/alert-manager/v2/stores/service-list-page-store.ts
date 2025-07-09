import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

export const useServiceListPageStore = defineStore('page-service-list', {
    state: () => ({
        unhealthyThisPage: 1,
        unhealthyPageSize: 12,
        healthyThisPage: 1,
        healthyPageSize: 6,
        searchFilters: [] as ConsoleFilter[],
    }),
    actions: {
        setUnhealthyPage(page: number) {
            this.unhealthyThisPage = page;
        },
        setHealthyPage(page: number) {
            this.healthyThisPage = page;
        },
        setSearchFilters(filters: ConsoleFilter[]) {
            this.searchFilters = filters;
        },
        setHealthyPageSize(size: number) {
            this.healthyPageSize = size;
        },
    },
});
