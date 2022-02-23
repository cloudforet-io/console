import { Action } from 'vuex';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


export const setDashboardList: Action<CostDashboardState, any> = async ({ commit }): Promise<void> => {
    try {
        const publicDashboardList = await SpaceConnector.client.costAnalysis.publicDashboard.list();
        const userDashboardList = await SpaceConnector.client.costAnalysis.userDashboard.list();
        commit('setPublicDashboard', publicDashboardList.results);
        commit('setUserDashboard', userDashboardList.results);
    } catch (e) {
        ErrorHandler.handleError(e);
        commit('setPublicDashboard', []);
        commit('setUserDashboard', []);
    }
};
