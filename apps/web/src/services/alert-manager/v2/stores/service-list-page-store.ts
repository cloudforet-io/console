import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

export const useServiceListPageStore = defineStore('serviceListPage', {
    state: () => ({
        unhealthyThisPage: 1,
        unhealthyPageSize: 10,
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
    },
});
