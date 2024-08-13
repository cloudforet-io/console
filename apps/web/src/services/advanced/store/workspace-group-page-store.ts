import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive({
        loading: false,
        groups: [] as WorkspaceGroupModel[],
        groupUsers: [],
        workspaces: [],
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = {
        selectedGroup: computed(() => {
            const [index] = state.selectedIndices;
            return state.groups[index];
        }),
    };

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
