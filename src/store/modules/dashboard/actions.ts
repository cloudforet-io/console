import type { Action } from 'vuex';

import type { DashboardState } from '@/store/modules/dashboard/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const loadDomainDashboard: Action<DashboardState, any> = ({ commit }): void => {
    try {
        const response = {};
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
