import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { MyPageState } from './type';

const state: MyPageState = {
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
