import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive({
        groups: [],
        groupUsers: [],
        workspaces: [],
        selectedGroup: {},
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
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
        ...actions,
    };
});
