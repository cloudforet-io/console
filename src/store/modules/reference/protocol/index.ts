import type { ProtocolReferenceState } from '@/store/modules/reference/protocol/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: ProtocolReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
