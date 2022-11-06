import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CostExplorerState } from '@/services/cost-explorer/store/type';

export const setDashboardList: Action<CostExplorerState, any> = async ({ commit }): Promise<void> => {
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

export const setHomeDashboard: Action<CostExplorerState, any> = (cxt, homeDashboardId: string) => {
    store.dispatch('settings/setItem', {
        key: 'homeDashboard',
        value: homeDashboardId,
        path: '/costExplorer',
    });
};
