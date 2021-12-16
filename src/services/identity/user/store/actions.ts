import { Action } from 'vuex';
import { MODAL_TYPE, UserStoreState } from '@/services/identity/user/store/type';

export const selectIndex: Action<UserStoreState, any> = ({ commit }, selectedIndex: number[]): void => {
    commit('setSelectedIndex', selectedIndex);
};

export const selectUsers: Action<UserStoreState, any> = ({ commit }, selectedUsers): void => {
    commit('setSelectedUsers', selectedUsers);
};

export const showModal: Action<UserStoreState, any> = ({ commit }, modalType: MODAL_TYPE): void => {
    if (modalType === MODAL_TYPE.MANAGEMENT) commit('setVisibleManagementModal', true);
    else if (modalType === MODAL_TYPE.CREATE) commit('setVisibleCreateModal', true);
    else if (modalType === MODAL_TYPE.UPDATE) commit('setVisibleUpdateModal', true);
};

export const hideModal: Action<UserStoreState, any> = ({ commit }, modalType): void => {
    if (modalType === MODAL_TYPE.MANAGEMENT) commit('setVisibleManagementModal', false);
    else if (modalType === MODAL_TYPE.CREATE) commit('setVisibleCreateModal', false);
    else if (modalType === MODAL_TYPE.UPDATE) commit('setVisibleUpdateModal', false);
};
