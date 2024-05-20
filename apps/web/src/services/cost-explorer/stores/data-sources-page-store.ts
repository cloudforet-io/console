import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { durationFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceAccountListParameters } from '@/schema/cost-analysis/data-source-account/api-verbs/list';
import type { CostDataSourceAccountResetParameters } from '@/schema/cost-analysis/data-source-account/api-verbs/reset';
import type { CostDataSourceAccountUpdateParameters } from '@/schema/cost-analysis/data-source-account/api-verbs/update';
import type { CostDataSourceAccountModel } from '@/schema/cost-analysis/data-source-account/model';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { CostJobListParameters } from '@/schema/cost-analysis/job/api-verbs/list';
import type { CostJobModel } from '@/schema/cost-analysis/job/model';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';
import { store } from '@/store';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

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

    const state = reactive({
        activeTab: 'detail',

        dataSourceList: [] as DataSourceModel[],
        dataSourceListTotalCount: 0,
        selectedDataSourceIndices: [] as number[],

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
        timezone: computed(() => store.state.user.timezone),
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
            finished_at: dayjs.utc(i.finished_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            created_at: dayjs.utc(i.created_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            duration: durationFormatter(i.created_at, i.finished_at, _getters.timezone) || '--',
        })))),
        linkedAccounts: computed<CostDataSourceAccountModel[]>(() => (state.linkedAccounts.map((i) => ({
            ...i,
            updated_at: dayjs.utc(i.updated_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
        })))),
        selectedDataSourceItem: computed<DataSourceItem>(() => {
            if (state.selectedDataSourceIndices.length === 0) return {} as DataSourceItem;
            const item = getters.dataSourceList[state.selectedDataSourceIndices[0]];
            if (!item) return {} as DataSourceItem;
            const pluginItem = _getters.plugin[item.plugin_info?.plugin_id || ''];
            return {
                ...item,
                description: pluginItem.description || '',
            };
        }),
    });

    const mutation = {
        selectedDataSourceIndices: (indices: number[]) => {
            state.selectedDataSourceIndices = indices;
        },
        selectedLinkedAccountsIndices: (indices: number[]) => {
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

            state.dataSourceList = [] as DataSourceModel[];
            state.dataSourceListTotalCount = 0;
            state.selectedDataSourceIndices = [] as number[];

            state.jobList = [] as CostJobModel[];
            state.jobListTotalCount = 0;

            state.linkedAccountsLoading = false;
            state.linkedAccountsPageStart = 0;
            state.linkedAccountsPageLimit = 15;
            state.linkedAccounts = [] as CostDataSourceAccountModel[];
            state.linkedAccountsTotalCount = 0;
            state.selectedLinkedAccountsIndices = [] as number[];
            state.linkedAccountsSearchFilters = [] as ConsoleFilter[];

            state.modal = {
                visible: false,
                type: undefined as CostLinkedAccountModalType|undefined,
            };
        },
        fetchDataSourceList: async (params?: CostDataSourceListParameters) => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>(params);
                state.dataSourceList = results || [];
                state.dataSourceListTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataSourceList = [];
                state.dataSourceListTotalCount = 0;
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
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        resetLinkedAccount: async (params: CostDataSourceAccountResetParameters) => {
            try {
                await SpaceConnector.clientV2.costAnalysis.dataSourceAccount.reset<CostDataSourceAccountResetParameters>(
                    params,
                );
            } catch (e) {
                ErrorHandler.handleError(e);
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
