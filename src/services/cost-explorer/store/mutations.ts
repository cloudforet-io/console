import { Mutation } from 'vuex';

import { CostExplorerState } from '@/services/cost-explorer/store/type';

export const setPublicDashboard: Mutation<CostExplorerState> = (state, dashboardList) => {
    state.publicDashboardList = dashboardList;
};

export const setUserDashboard: Mutation<CostExplorerState> = (state, dashboardList) => {
    state.userDashboardList = dashboardList;
};

export const setDashboardListLoading: Mutation<CostExplorerState> = (state, dashboardListLoading) => {
    state.dashboardListLoading = dashboardListLoading;
};
