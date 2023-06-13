import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, Schedule } from '@/services/asset-inventory/collector/model';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        loading: true,
        pageStart: 1,
        pageLimit: 15,
        sortBy: '',
        selectedProvider: 'all',
        collectors: [] as CollectorModel[],
        selectedCollector: {} as CollectorModel,
        searchFilters: [] as ConsoleFilter[],
        totalCount: 0,
        schedules: [] as Schedule[],
        visibleScheduleModal: false,

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
        async getCollectorList(queryData?: Query) {
            this.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.list({
                    query: queryData,
                });
                this.collectors = res.results;
                this.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async getCollectorSchedule(id) {
            try {
                const res = await SpaceConnector.client.inventory.collector.schedule.list({
                    collector_id: id,
                });
                this.schedules.push(...res.results);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        setSelectedProvider(provider) {
            this.selectedProvider = provider;
        },
        setFilteredCollectorList(filters) {
            this.searchFilters = filters;
        },
        setSelectedCollector(id) {
            const itemIndex = this.collectors.findIndex(
                (item) => item.collector_id === id,
            );
            this.selectedCollector = this.collectors[itemIndex];
        },
    },
});
