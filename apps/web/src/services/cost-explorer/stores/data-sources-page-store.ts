import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceAccountListParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/list';
import type { CostDataSourceAccountResetParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/reset';
import type { CostDataSourceAccountUpdateParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/update';
import type { CostDataSourceAccountModel } from '@/api-clients/cost-analysis/data-source-account/schema/model';
import type { CostDataSourceSyncParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/sync';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import type { CostJobCancelParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/cancel';
import type { CostJobListParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/list';
import type { CostJobModel } from '@/api-clients/cost-analysis/job/schema/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    CostLinkedAccountModalType,
} from '@/services/cost-explorer/types/data-sources-type';


export const useDataSourcesPageStore = defineStore('page-data-sources', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;
    const userStore = useUserStore();

    const state = reactive({
        selectedDataSourceId: undefined as string|undefined,

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
        linkedAccounts: computed<CostDataSourceAccountModel[]>(() => (state.linkedAccounts.map((i) => ({
            ...i,
            updated_at: dayjs.utc(i.updated_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
        })))),
    });

    const mutation = {
        setSelectedDataSourceId: (id: string|undefined) => {
            state.selectedDataSourceId = id;
        },
        setSelectedLinkedAccountsIndices: (indices: number[]) => {
            state.selectedLinkedAccountsIndices = indices;
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
            state.selectedDataSourceId = undefined;

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
