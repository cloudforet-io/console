import { computed, reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { DashboardType, DashboardFolderType, DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDashboardCreateParameters } from '@/schema/dashboard/private-dashboard/api-verbs/create';
import type { PrivateDashboardDeleteParameters } from '@/schema/dashboard/private-dashboard/api-verbs/delete';
import type { PrivateDashboardListParameters } from '@/schema/dashboard/private-dashboard/api-verbs/list';
import type { PrivateDashboardUpdateParameters } from '@/schema/dashboard/private-dashboard/api-verbs/update';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderListParameters } from '@/schema/dashboard/private-folder/api-verbs/list';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import type { PublicDashboardDeleteParameters } from '@/schema/dashboard/public-dashboard/api-verbs/delete';
import type { PublicDashboardListParameters } from '@/schema/dashboard/public-dashboard/api-verbs/list';
import type { PublicDashboardUpdateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/update';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderListParameters } from '@/schema/dashboard/public-folder/api-verbs/list';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';


type DashboardCreateParameters = PublicDashboardCreateParameters | PrivateDashboardCreateParameters;
type DashboardListParameters = PublicDashboardListParameters|PrivateDashboardListParameters;
type DashboardUpdateParameters = PublicDashboardUpdateParameters | PrivateDashboardUpdateParameters;
type DashboardDeleteParameters = PublicDashboardDeleteParameters | PrivateDashboardDeleteParameters;
type FolderListParameters = PublicFolderListParameters|PrivateFolderListParameters;
type FolderModel = PublicFolderModel|PrivateFolderModel;
interface LoadOptions {
    isProjectDashboard?: boolean;
}

export const useDashboardStore = defineStore('dashboard', () => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const favoriteStore = useFavoriteStore();
    const favoriteGetters = favoriteStore.getters;

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        currentWorkspace: computed(() => userWorkspaceStore.getters.currentWorkspace),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    });
    const state = reactive({
        publicDashboardItems: [] as PublicDashboardModel[],
        privateDashboardItems: [] as PrivateDashboardModel[],
        publicFolderItems: [] as PublicFolderModel[],
        privateFolderItems: [] as PrivateFolderModel[],
        searchFilters: [] as ConsoleFilter[],
        scope: undefined as DashboardScope | undefined,
        loading: true,
    });

    const getters = reactive({
        allDashboardItems: computed<DashboardModel[]>(() => [...state.privateDashboardItems, ...state.publicDashboardItems] as DashboardModel[]),
        domainDashboardItems: computed<PublicDashboardModel[]>(() => state.publicDashboardItems.filter((item) => item.resource_group === 'DOMAIN')),
        workspaceDashboardItems: computed<PublicDashboardModel[]>(() => state.publicDashboardItems
            .filter((item) => ['WORKSPACE', 'DOMAIN'].includes(item.resource_group))
            .filter((item) => !(item.resource_group === 'DOMAIN' && item.scope === 'PROJECT'))),
        privateDashboardItems: computed<PrivateDashboardModel[]>(() => state.privateDashboardItems),
        //
        allFolderItems: computed<FolderModel[]>(() => [...state.privateFolderItems, ...state.publicFolderItems]),
        domainFolderItems: computed<PublicFolderModel[]>(() => state.publicFolderItems.filter((item) => item.resource_group === 'DOMAIN')),
        workspaceFolderItems: computed<PublicFolderModel[]>(() => state.publicFolderItems
            .filter((item) => ['WORKSPACE', 'DOMAIN'].includes(item.resource_group))
            .filter((item) => !(item.resource_group === 'DOMAIN' && item.project_id === '*'))),
        privateFolderItems: computed<PrivateFolderModel[]>(() => state.privateFolderItems),
    });

    /* Mutations */
    const setScope = (scope?: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>) => {
        state.scope = scope;
    };
    const setSearchFilters = (filters: ConsoleFilter[]) => {
        state.searchFilters = filters;
    };
    const reset = () => {
        state.publicDashboardItems = [];
        state.privateDashboardItems = [];
        state.publicFolderItems = [];
        state.privateFolderItems = [];
        state.searchFilters = [];
        state.scope = undefined;
        state.loading = true;
    };

    /* Actions */
    const fetchApiQueryHelper = new ApiQueryHelper();
    const privateDashboardListFetcher = getCancellableFetcher<DashboardListParameters, ListResponse<DashboardModel>>(SpaceConnector.clientV2.dashboard.privateDashboard.list);
    const publicDashboardListFetcher = getCancellableFetcher<DashboardListParameters, ListResponse<DashboardModel>>(SpaceConnector.clientV2.dashboard.publicDashboard.list);
    const _fetchDashboard = async (dashboardType: DashboardType, params?: DashboardListParameters) => {
        const fetcher = dashboardType === 'PRIVATE' ? privateDashboardListFetcher : publicDashboardListFetcher;
        try {
            fetchApiQueryHelper.setFilters(state.searchFilters);
            const { status, response } = await fetcher({
                ...params,
                query: {
                    ...(params?.query || {}),
                    ...fetchApiQueryHelper.data,
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
    const _fetchFolder = async (folderType: DashboardFolderType, params?: FolderListParameters) => {
        const fetcher = folderType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateFolder.list
            : SpaceConnector.clientV2.dashboard.publicFolder.list;
        try {
            fetchApiQueryHelper.setFilters(state.searchFilters);
            const res: ListResponse<FolderModel> = await fetcher({
                ...params,
                query: {
                    ...(params?.query || {}),
                    ...fetchApiQueryHelper.data,
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
    const publicDashboardApiQueryHelper = new ApiQueryHelper();
    const load = async (options?: LoadOptions) => {
        const { isProjectDashboard } = options || {};
        publicDashboardApiQueryHelper.setFilters([]);
        if (_state.isAdminMode) {
            publicDashboardApiQueryHelper.addFilter({
                k: 'resource_group',
                v: 'DOMAIN',
                o: '=',
            });
        } else {
            publicDashboardApiQueryHelper.addFilter({
                k: 'resource_group',
                v: ['WORKSPACE', 'DOMAIN'],
                o: '=',
            });
        }

        if (isProjectDashboard) {
            publicDashboardApiQueryHelper.addFilter({
                k: 'project_id',
                v: '*',
                o: '=',
            });
        }

        const _publicDashboardParams = {
            query: {
                ...publicDashboardApiQueryHelper.data,
                sort: [{ key: 'created_at', desc: true }],
            },
        };
        state.loading = true;
        if (_state.isAdminMode) {
            await Promise.all([
                _fetchDashboard('PUBLIC', _publicDashboardParams),
                _fetchFolder('PUBLIC', _publicDashboardParams),
            ]);
        } else if (isProjectDashboard) {
            await Promise.all([
                _fetchDashboard('PUBLIC', _publicDashboardParams),
                _fetchFolder('PUBLIC', _publicDashboardParams),
            ]);
        } else {
            await Promise.allSettled([
                _fetchDashboard('PRIVATE'),
                _fetchDashboard('PUBLIC', _publicDashboardParams),
                _fetchFolder('PRIVATE'),
                _fetchFolder('PUBLIC', _publicDashboardParams),
            ]);
        }
        state.loading = false;
    };

    const createDashboard = async (dashboardType: DashboardType, params: DashboardCreateParameters): Promise<DashboardModel> => {
        const fetcher = dashboardType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateDashboard.create
            : SpaceConnector.clientV2.dashboard.publicDashboard.create;
        try {
            const result = await fetcher<DashboardCreateParameters, DashboardModel>(params);
            if (dashboardType === 'PRIVATE') {
                state.privateDashboardItems.push(result as PrivateDashboardModel);
            } else {
                state.publicDashboardItems.push(result as PublicDashboardModel);
            }
            return result;
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const updateDashboard = async (dashboardId: string, params: DashboardUpdateParameters): Promise<DashboardModel> => {
        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateDashboard.update
            : SpaceConnector.clientV2.dashboard.publicDashboard.update;
        try {
            const result = await fetcher<DashboardUpdateParameters, DashboardModel>({
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
        const params: DashboardDeleteParameters = { dashboard_id: dashboardId };
        try {
            await fetcher<DashboardDeleteParameters>(params);
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
    //
    const getDashboardNameList = (dashboardType: DashboardType) => {
        if (dashboardType === 'PRIVATE') return (state.privateDashboardItems.filter((i) => i.version === '2.0')).map((item) => item.name);
        return state.publicDashboardItems.filter((i) => i.version === '2.0').map((item) => item.name);
    };


    const mutations = {
        setScope,
        setSearchFilters,
    };
    const actions = {
        load,
        createDashboard,
        updateDashboard,
        deleteDashboard,
        getDashboardNameList,
        reset,
    };

    return {
        state,
        getters,
        ...actions,
        ...mutations,
    };
});
