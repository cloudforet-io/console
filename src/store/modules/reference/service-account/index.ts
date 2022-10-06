import type { ServiceAccountReferenceState } from '@/store/modules/reference/service-account/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: ServiceAccountReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
