import { defineStore } from 'pinia';

interface RolePageState {
    selectedIndices: number[];
}

export const useRolePageStore = defineStore('page-role', {
    state: (): RolePageState => ({
        selectedIndices: [] as number[],
    }),
    getters: {},
    actions: {
        setSelectedIndices(indices: number[]) {
            this.selectedIndices = indices;
        },
    },
});
