import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { Mutation } from 'vuex';


import type { DashboardState } from './type';

// TODO: implementation
export const setDomainItems: Mutation<DashboardState> = (state, dashboard): void => {
    state.domainItems = dashboard;
};
export const setProjectItems: Mutation<DashboardState> = (state, dashboard): void => {
    state.projectItems = dashboard;
};
export const setDomainItemCount: Mutation<DashboardState> = (state, count): void => {
    state.domainItemCount = count;
};
export const setProjectItemCount: Mutation<DashboardState> = (state, count): void => {
    state.projectItemCount = count;
};

export const setSearchFilters: Mutation<DashboardState> = (state, filters: ConsoleFilter[]): void => {
    state.searchFilters = filters;
};

export const setSelectedViewers: Mutation<DashboardState> = (state, viewers: string): void => {
    state.viewers = viewers;
};

export const setSelectedScope: Mutation<DashboardState> = (state, scope: string): void => {
    state.scope = scope;
};

export const setLoading: Mutation<DashboardState> = (state, loading: boolean): void => {
    state.loading = loading;
};
