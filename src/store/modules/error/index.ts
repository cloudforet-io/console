import { ErrorState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

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
