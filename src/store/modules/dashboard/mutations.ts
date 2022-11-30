import type { Mutation } from 'vuex';

import type { DashboardState } from './type';

// TODO: implementation
export const setDomainItems: Mutation<DashboardState> = (state, dashboard): void => {
    state.domainItems = dashboard;
};

export const setProcjetItems: Mutation<DashboardState> = (state, dashboard): void => {
    state.projectItems = dashboard;
};
