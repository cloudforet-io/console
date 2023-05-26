import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel } from '@/services/asset-inventory/collector/type';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        loading: true,
        totalCount: 0,
        pageStart: 1,
        pageLimit: 15,
        sortBy: '',
        selectedProvider: 'all',
        collectors: [] as CollectorModel[],
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
        async getCollectorList(queryData) {
            this.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.list({
                    query: queryData,
                });
                this.totalCount = res.totalCount;
                this.collectors = res.results;
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async setSelectedProvider(provider) {
            this.selectedProvider = provider;
        },
        async setCollectorList(collectorList) {
            this.collectorList = collectorList;
            this.filteredList = collectorList;
        },
        async setFilteredCollectorList(filters) {
            this.searchFilters = filters;
        },
    },
});
