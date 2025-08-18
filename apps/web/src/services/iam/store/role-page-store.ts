import { defineStore } from 'pinia';

interface RolePageState {
    selectedIndices: number[];
    selectedRoleIds: string[];
}

export const useRolePageStore = defineStore('page-role', {
    state: (): RolePageState => ({
        selectedIndices: [] as number[],
        selectedRoleIds: [] as string[],
    }),
    getters: {},
    actions: {
        setSelectedIndices(indices: number[]) {
            this.selectedIndices = indices;
        },
        setSelectedRoleIds(roleIds: string[]) {
            this.selectedRoleIds = roleIds;
        },
    },
});
