import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

interface WorkspacePageState {
    selectedWorkspace: WorkspaceModel;
    selectedIndex?: number;
}

export const useWorkspacePageStore = defineStore('page-workspace', () => {
    const state = reactive<WorkspacePageState>({
        selectedWorkspace: {} as WorkspaceModel,
        selectedIndex: undefined,
    });

    const mutations = {
        setSelectedWorkspace: (workspace: WorkspaceModel) => {
            state.selectedWorkspace = workspace;
        },
        setSelectedIndex: (index?: number) => {
            state.selectedIndex = index;
        },
    };

    const actions = {
        init: () => {
            state.selectedWorkspace = {} as WorkspaceModel;
            state.selectedIndex = undefined;
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
