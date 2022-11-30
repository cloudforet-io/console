
import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { DashboardState } from './type';

const state: DashboardState = {
    domainItems: [],
    projectItems: [],
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
