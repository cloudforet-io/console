
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import { defineStore } from 'pinia';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { JobAnalyzeInfo } from '@/services/asset-inventory/collector/collector-main/type';
import type { CollectorModel, Schedule, JobModel } from '@/services/asset-inventory/collector/model';

export const useCollectorPageStore = defineStore('collector-page', {
    state: () => ({
        loading: {
            collectorList: false,
        },
        selectedProvider: 'all',

        collectors: [] as CollectorModel[],
        selectedCollector: {} as CollectorModel,
        collectorJobStatus: [] as JobAnalyzeInfo[],
        schedules: [] as Schedule[],
        recentJobs: null as JobModel[]|null, // if null, it means that the first request is not yet finished

        totalCount: 0,
        pageStart: 1,
        pageLimit: 24,
        sortBy: 'name',
        searchFilters: [] as ConsoleFilter[],

        visible: {
            scheduleModal: false,
        },

    }),
    getters: {
        allFilters: (state): ConsoleFilter[] => {
            const filters: ConsoleFilter[] = [];
            if (state.selectedProvider !== 'all') {
                filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
            }
            return filters.concat(state.searchFilters);
        },
        recentJobForAllAccounts(): JobModel|null {
            if (Array.isArray(this.recentJobs) && this.recentJobs.length > 0) {
                const filteredJobs = this.recentJobs.filter((job) => !job.secret_id);
                return filteredJobs[0] ?? null;
            }
            return null;
        },
    },
    actions: {
        async getCollectorList(queryData: Query) {
            this.loading.collectorList = true;
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
                this.loading.collectorList = false;
            }
        },
        async getCollectorJobs(ids) {
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
        async getJobs() {
            try {
                const res = await SpaceConnector.client.inventory.job.list();
                this.recentJobs = res.results;
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
                showSuccessMessage(i18n.global.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
                return response;
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        setSelectedCollector(id) {
            const itemIndex = this.collectors.findIndex(
                (item) => item.collector_id === id,
            );
            this.selectedCollector = this.collectors[itemIndex];
        },
    },
});
