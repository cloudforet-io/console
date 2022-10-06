import type { UserReferenceState } from '@/store/modules/reference/user/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: UserReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
