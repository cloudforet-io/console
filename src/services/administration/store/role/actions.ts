import { Action } from 'vuex';

import { RoleData } from '@/services/administration/iam/role/type';
import { RoleStoreState } from '@/services/administration/store/role/type';

export const selectIndices: Action<RoleStoreState, any> = ({ commit }, selectedIndices: number[]): void => {
    commit('setSelectedIndices', selectedIndices);
};

export const selectRoles: Action<RoleStoreState, any> = ({ commit }, selectedRoles: RoleData[]): void => {
    commit('setSelectedRoles', selectedRoles);
};
