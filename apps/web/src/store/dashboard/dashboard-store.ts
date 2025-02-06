import { computed, reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type {
    DashboardType,
    DashboardFolderType,
    DashboardModel,
    DashboardListParams,
    DashboardUpdateParams,
} from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useDashboardStore = defineStore('dashboard', () => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const allReferenceStore = useAllReferenceStore();
    const userStore = useUserStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        currentWorkspace: computed(() => userWorkspaceStore.getters.currentWorkspace),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
        costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
        userId: computed<string|undefined>(() => userStore.state.userId),
    });
    const state = reactive({
        publicDashboardItems: [] as PublicDashboardModel[],
        privateDashboardItems: [] as PrivateDashboardModel[],
        publicFolderItems: [] as PublicFolderModel[],
        privateFolderItems: [] as PrivateFolderModel[],
        loading: true,
    });

    /* Mutations */
    const reset = () => {
        state.publicDashboardItems = [];
        state.privateDashboardItems = [];
        state.publicFolderItems = [];
        state.privateFolderItems = [];
        state.loading = true;
    };

    /* Actions */
    const fetchApiQueryHelper = new ApiQueryHelper();
    const privateDashboardListFetcher = getCancellableFetcher<DashboardListParams, ListResponse<DashboardModel>>(SpaceConnector.clientV2.dashboard.privateDashboard.list);
    const publicDashboardListFetcher = getCancellableFetcher<DashboardListParams, ListResponse<DashboardModel>>(SpaceConnector.clientV2.dashboard.publicDashboard.list);
    const _fetchDashboard = async (dashboardType: DashboardType) => {
        const fetcher = dashboardType === 'PRIVATE' ? privateDashboardListFetcher : publicDashboardListFetcher;
        try {
            fetchApiQueryHelper.setFilters([]);
            if (dashboardType === 'PUBLIC') {
                if (_state.isAdminMode) {
                    fetchApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
                } else {
                    fetchApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '=' });
                }
            }
            const { status, response } = await fetcher({
                query: {
                    ...fetchApiQueryHelper.data,
                    sort: [{ key: 'name', desc: false }],
                },
            });
            if (status === 'succeed') {
                const results = response.results || [];
                if (dashboardType === 'PRIVATE') {
                    state.privateDashboardItems = results as PrivateDashboardModel[];
                } else {
                    state.publicDashboardItems = results as PublicDashboardModel[];
                }
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            if (dashboardType === 'PRIVATE') {
                state.privateDashboardItems = [];
            } else {
                state.publicDashboardItems = [];
            }
        }
    };
    const folderApiQueryHelper = new ApiQueryHelper();
    const _fetchFolder = async (folderType: DashboardFolderType) => {
        const fetcher = folderType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateFolder.list
            : SpaceConnector.clientV2.dashboard.publicFolder.list;
        folderApiQueryHelper.setFilters([]);
        try {
            if (folderType === 'PUBLIC') {
                if (_state.isAdminMode) {
                    folderApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
                } else {
                    folderApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '=' });
                }
            }
            const res: ListResponse<FolderModel> = await fetcher({
                query: {
                    ...folderApiQueryHelper.data,
                    sort: [{ key: 'name', desc: false }],
                },
            });
            const results = res.results || [];
            if (folderType === 'PRIVATE') {
                state.privateFolderItems = results as PrivateFolderModel[];
            } else {
                state.publicFolderItems = results as PublicFolderModel[];
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            if (folderType === 'PRIVATE') {
                state.privateDashboardItems = [];
            } else {
                state.publicDashboardItems = [];
            }
        }
    };
    const load = async () => {
        state.loading = true;
        if (_state.isAdminMode) {
            await Promise.all([
                _fetchDashboard('PUBLIC'),
                _fetchFolder('PUBLIC'),
            ]);
        } else {
            await Promise.allSettled([
                _fetchDashboard('PRIVATE'),
                _fetchDashboard('PUBLIC'),
                _fetchFolder('PRIVATE'),
                _fetchFolder('PUBLIC'),
            ]);
        }
        state.loading = false;
    };

    // dashboard
    const updateDashboard = async (dashboardId: string, params: DashboardUpdateParams): Promise<DashboardModel> => {
        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateDashboard.update
            : SpaceConnector.clientV2.dashboard.publicDashboard.update;
        try {
            const result = await fetcher<DashboardUpdateParams, DashboardModel>({
                ...params,
                dashboard_id: dashboardId,
            });
            if (isPrivate) {
                const targetIndex = state.privateDashboardItems.findIndex((item) => item.dashboard_id === dashboardId);
                if (targetIndex !== -1) state.privateDashboardItems.splice(targetIndex, 1, result as PrivateDashboardModel);
                state.privateDashboardItems = cloneDeep(state.privateDashboardItems);
            } else {
                const targetIndex = state.publicDashboardItems.findIndex((item) => item.dashboard_id === dashboardId);
                if (targetIndex !== -1) state.publicDashboardItems.splice(targetIndex, 1, result as PublicDashboardModel);
                state.publicDashboardItems = cloneDeep(state.publicDashboardItems);
            }
            return result;
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };


    const actions = {
        load,
        updateDashboard,
        reset,
    };

    return {
        state,
        ...actions,
    };
});
