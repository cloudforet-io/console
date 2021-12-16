import { UserStoreState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

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
