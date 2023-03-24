import type { ProviderReferenceState } from '@/store/modules/reference/provider/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: ProviderReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
