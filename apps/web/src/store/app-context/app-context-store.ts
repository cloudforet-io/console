import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';
// eslint-disable-next-line import/no-cycle
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

interface AppContextStoreState {
    isAdminMode: boolean;
}

export const useAppContextStore = defineStore('app-context-store', () => {
    const workspaceStore = useWorkspaceStore();
    const allReferenceStore = useAllReferenceStore();

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

    watch(() => store.getters['user/getCurrentRoleInfo'], async (roleInfo) => {
        if (!roleInfo) return;
        await store.dispatch('reference/loadAll', { force: true });
        allReferenceStore.flush();
    });

    return {
        getters,
        ...actions,
    };
});
