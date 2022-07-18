import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { UserStoreState } from './type';

const state: UserStoreState = {
    selectedIndex: [],
    selectedUsers: [],
    visibleManagementModal: false,
    visibleCreateModal: false,
    visibleUpdateModal: false,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
