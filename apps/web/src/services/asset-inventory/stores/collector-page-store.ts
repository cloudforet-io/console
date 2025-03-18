import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CollectorListParameters } from '@/schema/inventory/collector/api-verbs/list';
import type { CollectorUpdateParameters } from '@/schema/inventory/collector/api-verbs/update';
import type { CollectorModel } from '@/schema/inventory/collector/model';
import type { Schedule } from '@/schema/inventory/collector/type';
import type { JobModel } from '@/schema/inventory/job/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { JobAnalyzeInfo } from '@/services/asset-inventory/types/collector-main-page-type';


export const useCollectorPageStore = defineStore('page-collector', () => {
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;

    const state = reactive({
        loading: {
            collectorList: true,
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
        scheduleModalMode: 'view',
    });
    const getters = reactive({
        allFilters: computed<ConsoleFilter[]>(() => {
            const filters: ConsoleFilter[] = [];
            if (state.selectedProvider !== 'all') {
                filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
            }
            if (appContextGetters.isAdminMode) {
                filters.push({ k: 'workspace_id', v: '*', o: '=' });
            }
            return filters.concat(state.searchFilters);
        }),
        recentJobForAllAccounts: computed<JobModel|null>(() => {
            if (Array.isArray(state.recentJobs) && state.recentJobs.length > 0) {
                const filteredJobs = state.recentJobs.filter((job) => !job.secret_id);
                return filteredJobs[0] ?? null;
            }
            return null;
        }),
    });
    const actions = {
        async getCollectorList(queryData: Query) {
            state.loading.collectorList = true;
            try {
                const res = await SpaceConnector.clientV2.inventory.collector.list<CollectorListParameters, ListResponse<CollectorModel>>({
                    query: queryData,
                });
                state.collectors = res.results ?? [];
                state.totalCount = res.total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                state.loading.collectorList = false;
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
                state.collectorJobStatus = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        async getJobs() {
            try {
                const res = await SpaceConnector.clientV2.inventory.job.list();
                state.recentJobs = res.results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        async updateCollectorSchedule(params) {
            try {
                const response = await SpaceConnector.clientV2.inventory.collector.update<CollectorUpdateParameters, CollectorModel>(params);
                const updatedCollectorIndex = state.collectors.findIndex((collector) => collector.collector_id === response.collector_id);
                state.collectors[updatedCollectorIndex] = response;
                showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
                return response;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
                return undefined;
            }
        },
        setSelectedCollector(id) {
            const itemIndex = state.collectors.findIndex(
                (item) => item.collector_id === id,
            );
            state.selectedCollector = state.collectors[itemIndex];
        },
        reset() {
            state.loading.collectorList = true;
            state.selectedProvider = 'all';
            state.collectors = [];
            state.selectedCollector = {} as CollectorModel;
            state.collectorJobStatus = [];
            state.schedules = [];
            state.recentJobs = null;
            state.totalCount = 0;
            state.pageStart = 1;
            state.pageLimit = 24;
            state.sortBy = 'name';
            state.searchFilters = [];
            state.visible.scheduleModal = false;
            state.scheduleModalMode = 'view';
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
