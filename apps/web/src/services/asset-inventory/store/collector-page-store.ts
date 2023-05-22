import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { CollectorModel } from '@/services/asset-inventory/collector/type';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        selectedProvider: 'all',
        searchFilters: [] as ConsoleFilter[],
        collectorList: undefined as CollectorModel[] | undefined,
        filteredList: undefined as CollectorModel[] | undefined,
    }),
    getters: {
        allFilters: (state): ConsoleFilter[] => {
            const filters: ConsoleFilter[] = [];
            if (state.selectedProvider !== 'all') {
                filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
            }
            return filters.concat(state.searchFilters);
        },
    },
    actions: {
        async setSelectedProvider(provider) {
            this.selectedProvider = provider;
        },
        async setCollectorList(collectorList) {
            this.collectorList = collectorList;
            this.filteredList = collectorList;
        },
    },
});
