import type { Module } from 'vuex';

import type { PublicDashboardInfo, UserDashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';

import * as actions from './actions';
import dashboard from './dashboard';
import * as getters from './getters';
import * as mutations from './mutations';
import type { CostExplorerState, CostExplorerStore } from './type';

const state: CostExplorerState = {
    publicDashboardList: [] as PublicDashboardInfo[],
    userDashboardList: [] as UserDashboardInfo[],
    dashboardListLoading: true,
};

export const costExplorerStoreModule: Module<CostExplorerState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        dashboard,
    },
    getters,
    actions,
    mutations,
};

export const costExplorerStore: CostExplorerStore = {} as CostExplorerStore;
