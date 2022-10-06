import type { SecretReferenceState } from '@/store/modules/reference/secret/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: SecretReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
