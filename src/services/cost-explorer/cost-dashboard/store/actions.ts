import { Action } from 'vuex';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { CostDashboardState } from '@/services/cost-explorer/cost-dashboard/store/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';


export const setDashboardList: Action<CostDashboardState, any> = async ({ commit }): Promise<void> => {
    const userId = store.state.user.userId;
    try {
        commit('setDashboardListLoading', true);
        const publicDashboardList = await SpaceConnector.client.costAnalysis.publicDashboard.list();
        const userDashboardList = await SpaceConnector.client.costAnalysis.userDashboard.list({
            user_id: userId,
        });
        commit('setPublicDashboard', publicDashboardList.results);
        commit('setUserDashboard', userDashboardList.results);
    } catch (e) {
        ErrorHandler.handleError(e);
        commit('setPublicDashboard', []);
        commit('setUserDashboard', []);
    } finally {
        commit('setDashboardListLoading', false);
    }
};
