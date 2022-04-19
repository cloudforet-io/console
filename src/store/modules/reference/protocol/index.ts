import { ProtocolReferenceState } from '@/store/modules/reference/protocol/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: ProtocolReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
