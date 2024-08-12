import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive({
        groups: [] as WorkspaceGroupModel[],
        groupUsers: [],
        workspaces: [],
        selectedIndices: [] as number[],
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
    });

    const getters = reactive({
        selectedGroup: computed(() => {
            const [index] = state.selectedIndices;
            return state.groups[index];
        }),
    });

    const actions = {
        updateModalSettings: ({
            type, title, themeColor = 'primary', visible,
        }) => {
            state.modal = {
                type,
                title,
                themeColor,
                visible,
            };
        },
        closeModal: () => {
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
