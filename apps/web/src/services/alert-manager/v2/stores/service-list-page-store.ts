import { defineStore } from 'pinia';

export const useServiceListPageStore = defineStore('serviceListPage', {
    state: () => ({
        unhealthyThisPage: 1,
        unhealthyPageSize: 10,
        healthyThisPage: 1,
        healthyPageSize: 6,
    }),
    actions: {
        setUnhealthyPage(page: number) {
            this.unhealthyThisPage = page;
        },
        setHealthyPage(page: number) {
            this.healthyThisPage = page;
        },
    },
});
