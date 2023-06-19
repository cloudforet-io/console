import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, JobAnalyzeModel, Schedule } from '@/services/asset-inventory/collector/model';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        loading: true,
        isRefreshList: false,
        pageStart: 1,
        pageLimit: 15,
        sortBy: '',
        selectedProvider: 'all',
        collectors: [] as CollectorModel[],
        selectedCollector: {} as CollectorModel,
        collectorJobStatus: [] as JobAnalyzeModel[],
        searchFilters: [] as ConsoleFilter[],
        totalCount: 0,
        schedules: [] as Schedule[],
        visibleScheduleModal: false,
        visibleRestartModal: false,

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
        async getCollectorList(queryData: Query) {
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
        async setCollectorJobs(ids) {
            try {
                const { results } = await SpaceConnector.clientV2.inventory.job.analyze({
                    query: {
                        filter: [
                            {
                                k: 'created_at',
                                v: 'now - 5d',
                                o: 'timediff_gte',
                            },
                            {
                                k: 'collector_id',
                                v: ids,
                                o: 'in',
                            },
                        ],
                        group_by: ['collector_id'],
                        fields: {
                            job_status: {
                                operator: 'push',
                                fields: {
                                    status: 'status',
                                    job_id: 'job_id',
                                    total_tasks: 'total_tasks',
                                    remained_tasks: 'remained_tasks',
                                    finished_at: 'finished_at',
                                },
                            },
                        },
                    },
                });
                this.collectorJobStatus = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async updateCollectorSchedule(params) {
            try {
                const response = await SpaceConnector.client.inventory.collector.update(params);
                const updatedCollectorIndex = this.collectors.findIndex((collector) => collector.collector_id === response.collector_id);
                this.collectors[updatedCollectorIndex] = response;
                showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
                return response;
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async restartCollector(collectorId: string) {
            try {
                await SpaceConnector.client.inventory.collector.collect({
                    collector_id: collectorId,
                });
                showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
                throw e;
            }
        },
        setSelectedProvider(provider: string) {
            this.selectedProvider = provider;
        },
        setSearchFilters(filters: ConsoleFilter[]) {
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
