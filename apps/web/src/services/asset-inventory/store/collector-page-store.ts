import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel } from '@/services/asset-inventory/collector/type';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        loading: true,
        hasCollectorList: false,
        pageStart: 1,
        pageLimit: 15,
        sortBy: '',
        selectedProvider: 'all',
        collectors: [] as CollectorModel[],
        searchFilters: [] as ConsoleFilter[],
        collectorList: null as CollectorModel[] | null,
        listCount: 0,
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
        async getInitCollectorList() {
            try {
                const res = await SpaceConnector.client.inventory.collector.list();
                this.collectors = res.results;
                if (res.total_count > 0) {
                    this.hasCollectorList = true;
                    this.listCount = res.total_count;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async getCollectorList(queryData?: Query) {
            this.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.list({
                    query: queryData,
                });
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
        },
        async setFilteredCollectorList(filters) {
            this.searchFilters = filters;
        },
    },
});
