// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { durationFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DataSourceAccountAnalyzeParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/analyze';
import type { CostDataSourceAccountListParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/list';
import type { CostDataSourceAccountResetParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/reset';
import type { CostDataSourceAccountUpdateParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/update';
import type { CostDataSourceAccountModel, CostDataSourceAnalyzeModel } from '@/api-clients/cost-analysis/data-source-account/schema/model';
import type { CostDataSourceGetParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/get';
import type { CostDataSourceListParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/list';
import type { CostDataSourceSyncParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/sync';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import type { CostJobCancelParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/cancel';
import type { CostJobListParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/list';
import type { CostJobModel } from '@/api-clients/cost-analysis/job/schema/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    CostJobItem,
    CostLinkedAccountModalType,
    DataSourceItem,
} from '@/services/cost-explorer/types/data-sources-type';


export const useDataSourcesPageStore = defineStore('page-data-sources', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;
    const userStore = useUserStore();

    const state = reactive({
        activeTab: 'detail',

        dataSourceListPageStart: 0,
        dataSourceListPageLimit: 15,
        dataSourceList: [] as DataSourceItem[],
        dataSourceListTotalCount: 0,
        dataSourceListSearchFilters: [] as ConsoleFilter[],
        selectedDataSourceIndices: undefined as number|undefined,
        selectedDataSourceItem: {} as DataSourceItem,
        dataSourceLoading: false,

        jobList: [] as CostJobModel[],
        jobListTotalCount: 0,

        linkedAccountsLoading: false,
        linkedAccountsPageStart: 0,
        linkedAccountsPageLimit: 15,
        linkedAccounts: [] as CostDataSourceAccountModel[],
        linkedAccountsTotalCount: 0,
        selectedLinkedAccountsIndices: [] as number[],
        linkedAccountsSearchFilters: [] as ConsoleFilter[],

        modal: {
            visible: false,
            type: undefined as CostLinkedAccountModalType|undefined,
        },
    });

    const _getters = reactive({
        plugin: computed(() => allReferenceGetters.plugin),
        timezone: computed<string|undefined>(() => userStore.state.timezone),
    });

    const getters = reactive({
        dataSourceList: computed<DataSourceItem[]>(() => state.dataSourceList.map((i) => {
            const icon = _getters.plugin[i.plugin_info?.plugin_id || '']?.icon;
            return {
                ...i,
                icon: assetUrlConverter(icon),
                created_at: dayjs.utc(i.created_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            };
        })),
        jobList: computed<CostJobItem[]>(() => (state.jobList.map((i) => ({
            ...i,
            total_tasks: i.total_tasks || 0,
            finished_at: i.status === 'IN_PROGRESS' ? '--' : dayjs.utc(i.finished_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            created_at: dayjs.utc(i.created_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            duration: durationFormatter(i.created_at, i.finished_at, _getters.timezone) || '--',
        })))),
        linkedAccounts: computed<CostDataSourceAccountModel[]>(() => (state.linkedAccounts.map((i) => ({
            ...i,
            updated_at: dayjs.utc(i.updated_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
        })))),
        selectedDataSourceItem: computed<DataSourceItem>(() => {
            if (state.selectedDataSourceIndices === undefined) return {} as DataSourceItem;
            if (!state.selectedDataSourceItem) return {} as DataSourceItem;
            const pluginItem = _getters.plugin[state.selectedDataSourceItem.plugin_info?.plugin_id || ''];
            return {
                ...state.selectedDataSourceItem,
                icon: assetUrlConverter(pluginItem?.icon),
                description: pluginItem?.description || '',
            };
        }),
    });

    const mutation = {
        setDataSourceListPageStart: (pageStart: number) => {
            state.dataSourceListPageStart = pageStart;
        },
        setDataSourceListPageLimit: (pageLimit: number) => {
            state.dataSourceListPageLimit = pageLimit;
        },
        setDataSourceListSearchFilters: (filters: ConsoleFilter[]) => {
            state.dataSourceListSearchFilters = filters;
        },
        setSelectedDataSourceIndices: (indices: number) => {
            state.selectedDataSourceIndices = indices;
        },
        setSelectedLinkedAccountsIndices: (indices: number[]) => {
            state.selectedLinkedAccountsIndices = indices;
        },
        setActiveTab: (tab: string) => {
            state.activeTab = tab;
        },
        setLinkedAccountsLoading: (loading: boolean) => {
            state.linkedAccountsLoading = loading;
        },
        setLinkedAccountsPageStart: (pageStart: number) => {
            state.linkedAccountsPageStart = pageStart;
        },
        setLinkedAccountsPageLimit: (pageLimit: number) => {
            state.linkedAccountsPageLimit = pageLimit;
        },
        setLinkedAccountsSearchFilters: (filters: ConsoleFilter[]) => {
            state.linkedAccountsSearchFilters = filters;
        },
        setModal: (visible: boolean, type?: CostLinkedAccountModalType) => {
            state.modal = {
                visible,
                type,
            };
        },
    };

    const actions = {
        reset: () => {
            state.activeTab = 'detail';

            state.dataSourceList = [];
            state.dataSourceListTotalCount = 0;
            state.selectedDataSourceIndices = undefined;

            state.jobList = [];
            state.jobListTotalCount = 0;

            actions.linkedAccountsReset();
        },
        linkedAccountsReset: () => {
            state.linkedAccountsLoading = false;
            state.linkedAccountsPageStart = 0;
            state.linkedAccountsPageLimit = 15;
            state.linkedAccounts = [];
            state.linkedAccountsTotalCount = 0;
            state.selectedLinkedAccountsIndices = [];
            state.linkedAccountsSearchFilters = [];

            state.modal = {
                visible: false,
                type: undefined as CostLinkedAccountModalType|undefined,
            };
        },
        jobReset: () => {
            state.jobList = [];
            state.jobListTotalCount = 0;
        },
        fetchDataSourceList: async (params?: CostDataSourceListParameters) => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<CostDataSourceModel>>(params);
                const analyzeDataList = await actions.fetchLinkedAccountAnalyze();
                state.dataSourceList = (results || []).map((item) => {
                    const matchingItem = analyzeDataList?.find((entry) => entry.data_source_id === item.data_source_id);
                    if (matchingItem) {
                        const linkedCount = matchingItem.workspaceList?.filter((id) => id !== null).length;
                        return {
                            ...item,
                            linked_count: linkedCount,
                        };
                    }
                    return item;
                });
                state.dataSourceListTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataSourceList = [];
                state.dataSourceListTotalCount = 0;
            }
        },
        fetchDataSourceItem: async (params?: CostDataSourceListParameters) => {
            try {
                state.dataSourceLoading = true;
                state.selectedDataSourceItem = await SpaceConnector.clientV2.costAnalysis.dataSource.get<CostDataSourceGetParameters, CostDataSourceModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.selectedDataSourceItem = {} as DataSourceItem;
            } finally {
                state.dataSourceLoading = false;
            }
        },
        fetchJobList: async (params: CostJobListParameters) => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.job.list<CostJobListParameters, ListResponse<CostJobModel>>(params);
                state.jobList = results || [];
                state.jobListTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.jobList = [];
                state.jobListTotalCount = 0;
            }
        },
        fetchLinkedAccount: async (params: CostJobListParameters) => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSourceAccount.list<CostDataSourceAccountListParameters, ListResponse<CostDataSourceAccountModel>>(
                    params,
                );
                state.linkedAccounts = results || [];
                state.linkedAccountsTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.linkedAccounts = [];
                state.linkedAccountsTotalCount = 0;
            }
        },
        updateLinkedAccount: async (params: CostDataSourceAccountUpdateParameters) => {
            try {
                await SpaceConnector.clientV2.costAnalysis.dataSourceAccount.update<CostDataSourceAccountUpdateParameters, CostDataSourceAccountModel>(
                    params,
                );
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        resetLinkedAccount: async (params: CostDataSourceAccountResetParameters) => {
            try {
                await SpaceConnector.clientV2.costAnalysis.dataSourceAccount.reset<CostDataSourceAccountResetParameters>(
                    params,
                );
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        fetchLinkedAccountAnalyze: async (): Promise<CostDataSourceAnalyzeModel | undefined> => {
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.dataSourceAccount.analyze<DataSourceAccountAnalyzeParameters, AnalyzeResponse<CostDataSourceAnalyzeModel>>({
                    query: {
                        group_by: ['data_source_id'],
                        fields: {
                            workspaceList: {
                                key: 'workspace_id',
                                operator: 'push',
                            },
                        },
                    },
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        },
        fetchSyncDatasource: async (params: CostDataSourceSyncParameters) => {
            try {
                await SpaceConnector.clientV2.costAnalysis.dataSource.sync<CostDataSourceSyncParameters, CostDataSourceModel>(
                    params,
                );
            } catch (e: any) {
                ErrorHandler.handleError(e, true);
            }
        },
        fetchCancelJob: async (params: CostJobCancelParameters) => {
            try {
                await SpaceConnector.clientV2.costAnalysis.job.cancel<CostJobCancelParameters, CostJobModel>(params);
            } catch (e: any) {
                ErrorHandler.handleError(e, true);
            }
        },
    };

    return {
        state,
        getters,
        ...mutation,
        ...actions,
    };
});
