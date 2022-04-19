import { UserReferenceState } from '@/store/modules/reference/user/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: UserReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
