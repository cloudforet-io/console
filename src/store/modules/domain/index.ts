import { DomainState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: DomainState = {
    domainId: undefined,
    name: undefined,
    extendedAuthType: undefined,
    authOptions: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
