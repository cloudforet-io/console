import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { RoleStoreState } from './type';

const state: RoleStoreState = {
    selectedIndices: [],
    selectedRoles: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
