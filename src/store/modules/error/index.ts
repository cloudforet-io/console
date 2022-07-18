import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { ErrorState } from './type';

const state: ErrorState = {
    visibleSessionExpiredError: false,
    visibleAuthorizationError: false,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
