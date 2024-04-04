import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { DomainState } from './type';

const state: DomainState = {
    domainId: undefined,
    name: undefined,
    extendedAuthType: undefined,
    authOptions: undefined,
    extraMenu: undefined,
    config: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
