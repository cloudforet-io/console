import type { Action } from 'vuex';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';
// import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DashboardState } from '@/store/modules/dashboard/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

// TODO: implementation
export const loadDomainDashboard: Action<DashboardState, any> = async ({ commit }): Promise<void> => {
    try {
        const response = [];
        // const response = await SpaceConnector.clientV2.dashboard.domainDashboard.list({
        //     domain_id: '',
        // });
        commit('setDomainItems', response);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const loadProjectDashboard: Action<DashboardState, any> = ({ commit }): void => {
    try {
        const response = {};
        commit('setProjectItems', response);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const setSearchFilters: Action<DashboardState, any> = ({ commit }, searchFilters: QueryStoreFilter[] = []): void => {
    commit('setSearchFilters', searchFilters);
};

export const setSelectedViewers: Action<DashboardState, any> = ({ commit }, selectedViewers: string): void => {
    commit('setSelectedViewers', selectedViewers);
};

export const setSelectedScope: Action<DashboardState, any> = ({ commit }, selectedScope: string): void => {
    commit('setSelectedScope', selectedScope);
};
