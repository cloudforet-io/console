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
        isAdminMode: computed(() => state.isAdminMode),
    });

    const actions = {
        switchToAdminMode() {
            userWorkspaceStore.setCurrentWorkspace();
            state.isAdminMode = true;
        },
        switchToWorkspaceMode() {
            userWorkspaceStore.setCurrentWorkspace();
            state.isAdminMode = false;
        },
    };


    return {
        getters,
        ...actions,
    };
});
