import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import { DomainState } from './type';

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
