import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

// eslint-disable-next-line import/no-cycle
import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

interface AppContextStoreState {
    isAdminMode: boolean;
}

export const useAppContextStore = defineStore('app-context-store', () => {
    const workspaceStore = useWorkspaceStore();

    const state = reactive<AppContextStoreState>({
        isAdminMode: false,
    });

    const getters = reactive({
        isAdminMode: computed(() => state.isAdminMode),
    });

    const actions = {
        switchToAdminMode() {
            workspaceStore.setCurrentWorkspace();
            state.isAdminMode = true;
        },
        switchToWorkspaceMode() {
            workspaceStore.setCurrentWorkspace();
            state.isAdminMode = false;
        },
    };

    return {
        getters,
        ...actions,
    };
});
