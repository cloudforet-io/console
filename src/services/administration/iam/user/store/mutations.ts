import { Mutation } from 'vuex';
import { UserStoreState } from './type';

export const setSelectedIndex: Mutation<UserStoreState> = (state, selectedIndex: number[]): void => {
    state.selectedIndex = selectedIndex;
};

export const setSelectedUsers: Mutation<UserStoreState> = (state, selectedUsers: any[]): void => {
    state.selectedUsers = selectedUsers;
};

export const setVisibleManagementModal: Mutation<UserStoreState> = (state, visible: boolean): void => {
    state.visibleManagementModal = visible;
};

export const setVisibleCreateModal: Mutation<UserStoreState> = (state, visible: boolean): void => {
    state.visibleCreateModal = visible;
};

export const setVisibleUpdateModal: Mutation<UserStoreState> = (state, visible: boolean): void => {
    state.visibleUpdateModal = visible;
};
