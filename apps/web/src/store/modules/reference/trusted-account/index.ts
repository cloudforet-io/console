

import type { TrustedAccountReferenceState } from '@/store/modules/reference/trusted-account/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: TrustedAccountReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
