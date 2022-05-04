import { Action } from 'vuex';
import { RoleStoreState } from '@/services/administration/store/role/type';
import { RoleData } from '@/services/administration/iam/role/type';

export const selectIndices: Action<RoleStoreState, any> = ({ commit }, selectedIndices: number[]): void => {
    commit('setSelectedIndices', selectedIndices);
};

export const selectRoles: Action<RoleStoreState, any> = ({ commit }, selectedRoles: RoleData[]): void => {
    commit('setSelectedRoles', selectedRoles);
};
