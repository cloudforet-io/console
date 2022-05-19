import { CollectorReferenceState } from '@/store/modules/reference/collector/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: CollectorReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
