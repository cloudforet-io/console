import type { Mutation } from 'vuex';

import type { RoleStoreState } from './type';

export const setSelectedIndices: Mutation<RoleStoreState> = (state, selectedIndices: number[]): void => {
    state.selectedIndices = selectedIndices;
};

export const setSelectedRoles: Mutation<RoleStoreState> = (state, selectedRoles: any[]): void => {
    state.selectedRoles = selectedRoles;
};
