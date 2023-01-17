
import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { DashboardState } from './type';

// TODO: implementation
const state: DashboardState = {
    domainItems: [],
    projectItems: [],
    searchFilters: [],
    viewers: 'ALL',
    scope: 'ALL',
    domainItemCount: 0,
    projectItemCount: 0,
    loading: true,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
