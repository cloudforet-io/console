import type { RegionReferenceState } from '@/store/modules/reference/region/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: RegionReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
