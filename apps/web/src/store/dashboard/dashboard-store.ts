import { computed, reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { getClonedName } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type {
    DashboardType,
    DashboardFolderType,
    DashboardModel,
    DashboardCreateParams,
    DashboardListParams,
    DashboardUpdateParams,
    DashboardDeleteParams,
} from '@/schema/dashboard/_types/dashboard-type';
import type { FolderCreateParams, FolderModel } from '@/schema/dashboard/_types/folder-type';
import type { WidgetListParams, WidgetModel } from '@/schema/dashboard/_types/widget-type';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderCreateParameters } from '@/schema/dashboard/public-folder/api-verbs/create';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';



const listDashboardWidgets = async (dashboardId: string): Promise<WidgetModel[]> => {
    try {
        const isPrivate = dashboardId.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.list
            : SpaceConnector.clientV2.dashboard.publicWidget.list;
        const { results } = await fetcher<WidgetListParams, ListResponse<WidgetModel>>({
            dashboard_id: dashboardId,
        });
        return results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
export const useDashboardStore = defineStore('dashboard', () => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const favoriteStore = useFavoriteStore();
    const favoriteGetters = favoriteStore.getters;
    const allReferenceStore = useAllReferenceStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        currentWorkspace: computed(() => userWorkspaceStore.getters.currentWorkspace),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
        costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
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
                    sort: [{ key: 'created_at', desc: true }],
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
                    sort: [{ key: 'created_at', desc: true }],
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
    const createDashboard = async (dashboardType: DashboardType, params: DashboardCreateParams): Promise<DashboardModel> => {
        const fetcher = dashboardType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateDashboard.create
            : SpaceConnector.clientV2.dashboard.publicDashboard.create;
        const result = await fetcher<DashboardCreateParams, DashboardModel>(params);
        if (dashboardType === 'PRIVATE') {
            state.privateDashboardItems.push(result as PrivateDashboardModel);
        } else {
            state.publicDashboardItems.push(result as PublicDashboardModel);
        }
        return result;
    };
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
    const deleteDashboard = async (dashboardId: string) => {
        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateDashboard.delete
            : SpaceConnector.clientV2.dashboard.publicDashboard.delete;
        const params: DashboardDeleteParams = { dashboard_id: dashboardId };
        try {
            await fetcher<DashboardDeleteParams>(params);
            if (isPrivate) {
                const targetIndex = state.privateDashboardItems.findIndex((item) => item.dashboard_id === dashboardId);
                if (targetIndex !== -1) state.privateDashboardItems.splice(targetIndex, 1);
                state.privateDashboardItems = cloneDeep(state.privateDashboardItems);
            } else {
                const targetIndex = state.publicDashboardItems.findIndex((item) => item.dashboard_id === dashboardId);
                if (targetIndex !== -1) state.publicDashboardItems.splice(targetIndex, 1);
                state.publicDashboardItems = cloneDeep(state.publicDashboardItems);
            }

            const isFavoriteItem = favoriteGetters.dashboardItems.find((item) => item.itemId === dashboardId);
            if (isFavoriteItem) {
                await favoriteStore.deleteFavorite({
                    itemType: FAVORITE_TYPE.DASHBOARD,
                    workspaceId: _state.currentWorkspaceId || '',
                    itemId: dashboardId,
                });
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const getDashboardNameList = (dashboardType: DashboardType) => {
        if (dashboardType === 'PRIVATE') {
            return (state.privateDashboardItems.filter((i) => i.version !== '1.0')).map((item) => item.name);
        }
        return state.publicDashboardItems.filter((i) => i.version !== '1.0').map((item) => item.name);
    };
    const cloneDashboard = async (dashboardId: string, isPrivate?: boolean, folderId?: string): Promise<DashboardModel> => {
        const _dashboardType = isPrivate ? 'PRIVATE' : 'PUBLIC';
        const _allDashboardItems = [...state.privateDashboardItems, ...state.publicDashboardItems];
        const _dashboard = _allDashboardItems.find((item) => item.dashboard_id === dashboardId);
        if (!_dashboard) throw new Error('Dashboard not found');

        const _dashboardNameList = getDashboardNameList(_dashboardType);
        const _dashboardWidgets = await listDashboardWidgets(_dashboard.dashboard_id);
        const _createdLayouts = await getSharedDashboardLayouts(_dashboard.layouts, _dashboardWidgets, _state.costDataSource);
        const _createdDashboardParams: DashboardCreateParams = {
            name: getClonedName(_dashboardNameList, _dashboard.name),
            layouts: _createdLayouts,
            options: _dashboard.options || {},
            labels: _dashboard.labels || [],
            tags: { created_by: store.state.user.userId },
            folder_id: folderId,
        };
        if (_state.isAdminMode) {
            (_createdDashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (!isPrivate) {
            (_createdDashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
        }
        const createdDashboard = await createDashboard(_dashboardType, _createdDashboardParams);
        return createdDashboard;
    };

    // folder
    const createFolder = async (name: string, isPrivate: boolean): Promise<string|undefined> => {
        try {
            const fetcher = isPrivate ? SpaceConnector.clientV2.dashboard.privateFolder.create : SpaceConnector.clientV2.dashboard.publicFolder.create;
            const _existingFolderNameList = isPrivate ? state.privateFolderItems.map((d) => d.name) : state.publicFolderItems.map((d) => d.name);
            const params: FolderCreateParams = {
                name: getClonedName(_existingFolderNameList, name),
                tags: { created_by: store.state.user.userId },
            };
            if (!isPrivate) {
                (params as PublicFolderCreateParameters).resource_group = _state.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE;
            }
            const createdFolder = await fetcher(params);
            return createdFolder.folder_id;
        } catch (e) {
            return undefined;
        }
    };

    const actions = {
        load,
        createDashboard,
        updateDashboard,
        deleteDashboard,
        getDashboardNameList,
        reset,
        createFolder,
        cloneDashboard,
    };

    return {
        state,
        ...actions,
    };
});
