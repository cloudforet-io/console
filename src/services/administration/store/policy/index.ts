import type { PolicyState } from '@/services/administration/store/policy/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: PolicyState = {
    policyData: null,
    policyListLoading: false,
    policyList: undefined,
    totalCount: 0,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
