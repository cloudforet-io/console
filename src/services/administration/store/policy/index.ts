import { PolicyState } from '@/services/administration/store/policy/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: PolicyState = {
    policyData: null,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
