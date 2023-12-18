import { computed, reactive } from 'vue';

import { getTextHighlightRegex } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';
import type { CreateDashboardParameters } from '@/schema/dashboard/dashboard/api-verbs/create';
import type { ListDashboardParameters } from '@/schema/dashboard/dashboard/api-verbs/list';
import type { UpdateDashboardParameters } from '@/schema/dashboard/dashboard/api-verbs/update';
import type { DashboardModel } from '@/schema/dashboard/dashboard/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


const getApiQuery = () => new ApiQueryHelper().setFilters([{
    k: 'user_id',
    v: [null, store.state.user.userId || ''],
    o: '=',
}]).data;
const getItems = (items: DashboardModel[], filters: ConsoleFilter[], dashboardType?: DashboardType): DashboardModel[] => {
    let result = items;
    if (dashboardType) {
        result = result.filter((d) => d.dashboard_type === dashboardType);
    }
    filters.forEach((d) => {
        if (d.k === 'label' && Array.isArray(d.v)) {
            d.v.forEach((value) => {
                if (typeof value === 'string') {
                    result = result.filter((item) => item.labels.includes(value));
                }
            });
        } else if (!d.k && d.v) {
            if (typeof d.v === 'string') {
                const regex = getTextHighlightRegex(d.v);
                result = result.filter((item) => regex.test(item.name));
            }
        }
    });
    return result;
};

export const useDashboardStore = defineStore('dashboard', () => {
    const appContextStore = useAppContextStore();

    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        items: [] as DashboardModel[],
        totalCount: 0,
        searchFilters: [] as ConsoleFilter[],
        dashboardType: undefined as undefined|DashboardType,
        scope: undefined as undefined|ResourceGroupType,
        loading: true,
    });

    const getters = reactive({
        domainItems: computed(() => state.items),
        workspaceItems: computed(() => state.items.filter((item) => item.resource_group === 'WORKSPACE')),
        projectItems: computed(() => state.items.filter((item) => item.resource_group === 'PROJECT')),
    });

    /* Mutations */
    const setDashboardType = (dashboardType?: DashboardType) => {
        state.dashboardType = dashboardType;
    };
    const setScope = (scope?: ResourceGroupType) => {
        state.scope = scope;
    };
    const setSearchFilters = (filters: ConsoleFilter[]) => {
        state.searchFilters = filters;
    };
    const reset = () => {
        state.items = [];
        state.totalCount = 0;
        state.searchFilters = [];
        state.dashboardType = undefined;
        state.scope = undefined;
        state.loading = true;
    };

    /* Actions */
    const load = async (params?: ListDashboardParameters) => {
        const query = getApiQuery();
        const _params: ListDashboardParameters = {
            ...params,
            query: {
                ...(params?.query || {}),
                ...query,
            },
        };
        if (_state.isAdminMode) {
            _params.resource_group = 'DOMAIN';
        }
        state.loading = true;
        try {
            const res = await SpaceConnector.clientV2.dashboard.dashboard.list<ListDashboardParameters, ListResponse<DashboardModel>>(_params);
            state.items = res.results || [];
            state.totalCount = res.total_count || 0;
        } catch (e) {
            ErrorHandler.handleError(e);
            state.items = [];
            state.totalCount = 0;
        } finally {
            state.loading = false;
        }
    };

    const createDashboard = async (params: CreateDashboardParameters): Promise<DashboardModel> => {
        try {
            const result = await SpaceConnector.clientV2.dashboard.dashboard.create<CreateDashboardParameters, DashboardModel>(params);
            state.items.push(result);
            return result;
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const updateDashboard = async (params: UpdateDashboardParameters) => {
        try {
            const result = await SpaceConnector.clientV2.dashboard.dashboard.update<UpdateDashboardParameters, DashboardModel>(params);
            const index = state.items.findIndex((item) => item.dashboard_id === params.dashboard_id);
            if (index !== -1) {
                state.items.splice(index, 1, result);
            }
            state.items = cloneDeep(state.items);
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const deleteDashboard = async (dashboardId: string) => {
        try {
            await SpaceConnector.clientV2.dashboard.dashboard.delete({ dashboard_id: dashboardId });
            const index = state.items.findIndex((item) => item.dashboard_id === dashboardId);
            if (index !== -1) {
                state.items.splice(index, 1);
            }
            state.items = cloneDeep(state.items);
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    //
    const getDashboardNameList = (dashboardName: string, projectId?: string) => {
        if (projectId) {
            return state.items
                .filter((item) => (item.project_id === projectId) && item.name !== dashboardName)
                .map((_item) => _item.name);
        }
        return getItems(state.items, state.searchFilters, state.dashboardType).map((item) => {
            if (item.name !== dashboardName) return item.name;
            return '';
        });
    };


    const mutations = {
        setDashboardType,
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

