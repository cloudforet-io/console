import { defineStore } from 'pinia';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';

interface RolePageState {
    loading: boolean;
    roles: RoleModel[];
    totalCount: number;
    selectedIndices: number[];
    pageStart: number,
    pageLimit: number,
}

export const useRolePageStore = defineStore('page-role', {
    state: (): RolePageState => ({
        loading: false,
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
    }),
    getters: {
        selectedRoles: (state) => state.selectedIndices.reduce((refined: RoleModel[], idx: number) => {
            if (state.roles[idx].role_type !== ROLE_TYPE.SYSTEM_ADMIN) {
                refined.push(state.roles[idx]);
            }
            return refined;
        }, []),
    },
    actions: {
        setSelectedIndices(indices: number[]) {
            this.selectedIndices = indices;
        },
    },
});
