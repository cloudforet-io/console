import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

interface AppContextStoreState {
    isAdminMode: boolean;
    globalGrantLoading: boolean;
}

export const useAppContextStore = defineStore('app-context-store', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const state = reactive<AppContextStoreState>({
        isAdminMode: false,
        globalGrantLoading: false,
    });

    const getters = reactive({
        isAdminMode: computed<boolean>(() => state.isAdminMode),
        globalGrantLoading: computed<boolean>(() => state.globalGrantLoading),
        workspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
        isUserMode: computed(() => !state.isAdminMode && userWorkspaceStore.getters.currentWorkspaceId === undefined),
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
        setGlobalGrantLoading(loading: boolean) {
            state.globalGrantLoading = loading;
        },
    };

    return {
        getters,
        ...actions,
    };
});
