import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

interface AppContextStoreState {
    isAdminMode: boolean;
}

export const useAppContextStore = defineStore('app-context-store', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const state = reactive<AppContextStoreState>({
        isAdminMode: false,
    });

    const getters = reactive({
        isAdminMode: computed<boolean>(() => state.isAdminMode),
        workspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    const actions = {
        enterAdminMode() {
            userWorkspaceStore.setCurrentWorkspace();
            state.isAdminMode = true;
        },
        exitAdminMode() {
            userWorkspaceStore.setCurrentWorkspace();
            state.isAdminMode = false;
        },
    };


    return {
        getters,
        ...actions,
    };
});
