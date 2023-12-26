import { computed, reactive } from 'vue';

import { cloneDeep, get } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    CreateDashboardParameters, DashboardModel, ListDashboardParameters, UpdateDashboardParameters,
    DeleteDashboardParameters,
} from '@/services/dashboards/types/dashboard-api-schema-type';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';



// const getItems = (items: DashboardModel[], filters: ConsoleFilter[]): DashboardModel[] => {
//     let result = items;
//     filters.forEach((d) => {
//         if (d.k === 'label' && Array.isArray(d.v)) {
//             d.v.forEach((value) => {
//                 if (typeof value === 'string') {
//                     result = result.filter((item) => item.labels.includes(value));
//                 }
//             });
//         } else if (!d.k && d.v) {
//             if (typeof d.v === 'string') {
//                 const regex = getTextHighlightRegex(d.v);
//                 result = result.filter((item) => regex.test(item.name));
//             }
//         }
//     });
//     return result;
// };

export const useDashboardStore = defineStore('dashboard', () => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        currentWorkspace: computed(() => userWorkspaceStore.getters.currentWorkspace),
    });
    const state = reactive({
        publicDashboardItems: [] as PublicDashboardModel[],
        privateDashboardItems: [] as PrivateDashboardModel[],
        totalCount: 0,
        publicDashboardCount: 0,
        privateDashboardCount: 0,
        searchFilters: [] as ConsoleFilter[],
        scope: undefined as DashboardScope | undefined,
        loading: true,
    });

    const getters = reactive({
        allItems: computed<Array<PublicDashboardModel|PrivateDashboardModel>>(() => [...state.privateDashboardItems, ...state.publicDashboardItems]),
        domainItems: computed<PublicDashboardModel[]>(() => state.publicDashboardItems.filter((item) => item.resource_group === 'DOMAIN')),
        workspaceItems: computed<PublicDashboardModel[]>(() => state.publicDashboardItems.filter((item) => item.resource_group === 'WORKSPACE')),
        projectItems: computed<PublicDashboardModel[]>(() => state.publicDashboardItems.filter((item) => item.resource_group === 'PROJECT')),
        privateItems: computed<PrivateDashboardModel[]>(() => state.privateDashboardItems),
    });

    /* Mutations */
    const setScope = (scope?: ResourceGroupType) => {
        state.scope = scope;
    };
    const setSearchFilters = (filters: ConsoleFilter[]) => {
        state.searchFilters = filters;
    };
    const reset = () => {
        state.publicDashboardItems = [];
        state.privateDashboardItems = [];
        state.totalCount = 0;
        state.searchFilters = [];
        state.scope = undefined;
        state.loading = true;
    };

    /* Actions */
    const fetchApiQueryHelper = new ApiQueryHelper();
    const fetchDashboard = async (dashboardType: DashboardType, params?: ListDashboardParameters) => {
        const fetcher = dashboardType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateDashboard.list
            : SpaceConnector.clientV2.dashboard.publicDashboard.list;
        try {
            fetchApiQueryHelper.setFilters(state.searchFilters);
            const res: ListResponse<DashboardModel> = await fetcher({
                ...params,
                query: {
                    ...(params?.query || {}),
                    ...fetchApiQueryHelper.data,
                },
            });
            const results = res.results || [];
            const totalCount = res.total_count || 0;
            if (dashboardType === 'PRIVATE') {
                state.privateDashboardItems = results as PrivateDashboardModel[];
                state.privateDashboardCount = totalCount;
            } else {
                state.publicDashboardItems = results as PublicDashboardModel[];
                state.publicDashboardCount = totalCount;
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            if (dashboardType === 'PRIVATE') {
                state.privateDashboardItems = [];
                state.privateDashboardCount = 0;
            } else {
                state.publicDashboardItems = [];
                state.publicDashboardCount = 0;
            }
        }
    };
    const publicDashboardApiQueryHelper = new ApiQueryHelper();
    const load = async (params?: ListDashboardParameters) => {
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
                v: ['WORKSPACE', 'PROJECT'],
                o: '',
            }, {
                k: 'workspace_id',
                v: _state.currentWorkspace?.workspace_id || '',
                o: '=',
            });
        }

        const _publicDashboardParams = {
            ...params,
            query: {
                ...(params?.query || {}),
                ...publicDashboardApiQueryHelper.data,
            },
        };
        state.loading = true;
        if (_state.isAdminMode) {
            await fetchDashboard('PUBLIC', _publicDashboardParams);
        } else {
            await Promise.allSettled([
                fetchDashboard('PRIVATE', params),
                fetchDashboard('PUBLIC', _publicDashboardParams),
            ]);
        }
        state.loading = false;
    };

    const createDashboard = async (dashboardType: DashboardType, params: CreateDashboardParameters): Promise<DashboardModel> => {
        const fetcher = dashboardType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateDashboard.create
            : SpaceConnector.clientV2.dashboard.publicDashboard.create;
        try {
            const result = await fetcher<CreateDashboardParameters, DashboardModel>(params);
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
    const updateDashboard = async (dashboardId: string, params: UpdateDashboardParameters): Promise<DashboardModel> => {
        const isPrivate = dashboardId?.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateDashboard.update
            : SpaceConnector.clientV2.dashboard.publicDashboard.update;
        try {
            const result = await fetcher<UpdateDashboardParameters, DashboardModel>(params);
            if (isPrivate) {
                const targetIndex = state.privateDashboardItems.findIndex((item) => item.private_dashboard_id === get(params, 'private_dashboard_id'));
                if (targetIndex !== -1) state.privateDashboardItems.splice(targetIndex, 1, result as PrivateDashboardModel);
                state.privateDashboardItems = cloneDeep(state.privateDashboardItems);
            } else {
                const targetIndex = state.publicDashboardItems.findIndex((item) => item.public_dashboard_id === get(params, 'public_dashboard_id'));
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
        const params: DeleteDashboardParameters = isPrivate ? { private_dashboard_id: dashboardId } : { public_dashboard_id: dashboardId };
        try {
            await fetcher<DeleteDashboardParameters>(params);
            if (isPrivate) {
                const targetIndex = state.privateDashboardItems.findIndex((item) => item.private_dashboard_id === dashboardId);
                if (targetIndex !== -1) state.privateDashboardItems.splice(targetIndex, 1);
                state.privateDashboardItems = cloneDeep(state.privateDashboardItems);
            } else {
                const targetIndex = state.publicDashboardItems.findIndex((item) => item.public_dashboard_id === dashboardId);
                if (targetIndex !== -1) state.publicDashboardItems.splice(targetIndex, 1);
                state.publicDashboardItems = cloneDeep(state.publicDashboardItems);
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    //
    const getDashboardNameList = (dashboardType: DashboardType) => {
        if (dashboardType === 'PRIVATE') return state.privateDashboardItems.map((item) => item.name);
        return state.publicDashboardItems.map((item) => item.name);
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

