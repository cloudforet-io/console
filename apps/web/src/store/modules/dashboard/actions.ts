import type { Action } from 'vuex';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type { DashboardState } from '@/store/modules/dashboard/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

const getApiQuery = () => new ApiQueryHelper().setFilters([{
    k: 'user_id',
    v: [null, store.state.user.userId || ''],
    o: '=',
}]).data;

export const loadDomainDashboard: Action<DashboardState, any> = async ({ commit }): Promise<void> => {
    const query = getApiQuery();

    try {
        const { results, total_count } = await SpaceConnector.clientV2.dashboard.domainDashboard.list({ query });
        if (results) {
            commit('setDomainItems', results);
            commit('setDomainItemCount', total_count);
        } else {
            commit('setDomainItems', []);
            commit('setDomainItemCount', 0);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
export const loadProjectDashboard: Action<DashboardState, any> = async ({ commit }): Promise<void> => {
    const query = getApiQuery();

    try {
        const { results, total_count } = await SpaceConnector.clientV2.dashboard.projectDashboard.list({ query });
        if (results) {
            commit('setProjectItems', results);
            commit('setProjectItemCount', total_count);
        } else {
            commit('setProjectItems', []);
            commit('setProjectItemCount', 0);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const loadAllDashboard: Action<DashboardState, any> = async ({ dispatch, commit }): Promise<void> => {
    commit('setLoading', true);
    await Promise.allSettled([
        await dispatch('loadDomainDashboard'),
        await dispatch('loadProjectDashboard'),
    ]);
    commit('setLoading', false);
};

export const setSearchFilters: Action<DashboardState, any> = ({ commit }, searchFilters: ConsoleFilter[] = []): void => {
    commit('setSearchFilters', searchFilters);
};

export const setSelectedViewers: Action<DashboardState, any> = ({ commit }, selectedViewers: string): void => {
    commit('setSelectedViewers', selectedViewers);
};

export const setSelectedScope: Action<DashboardState, any> = ({ commit }, selectedScope: string): void => {
    commit('setSelectedScope', selectedScope);
};
