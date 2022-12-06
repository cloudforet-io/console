import type { Mutation } from 'vuex';

import type { QueryStoreFilter } from '@/query/type';

import type { DashboardState } from './type';

// TODO: implementation
export const setDomainItems: Mutation<DashboardState> = (state, dashboard): void => {
    state.domainItems = dashboard;
};

export const setProcjetItems: Mutation<DashboardState> = (state, dashboard): void => {
    state.projectItems = dashboard;
};

export const setSearchFilters: Mutation<DashboardState> = (state, filters: QueryStoreFilter[]): void => {
    state.searchFilters = filters;
};

export const setSelectedViewers: Mutation<DashboardState> = (state, viewers: string): void => {
    state.viewers = viewers;
};

export const setSelectedScope: Mutation<DashboardState> = (state, scope: string): void => {
    state.scope = scope;
};
