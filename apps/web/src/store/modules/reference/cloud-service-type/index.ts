import type { CloudServiceTypeReferenceState } from '@/store/modules/reference/cloud-service-type/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: CloudServiceTypeReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
