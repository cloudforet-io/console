import { PublicDashboardInfo, UserDashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { CostExplorerState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: CostExplorerState = {
    publicDashboardList: [] as PublicDashboardInfo[],
    userDashboardList: [] as UserDashboardInfo[],
    dashboardListLoading: true,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
