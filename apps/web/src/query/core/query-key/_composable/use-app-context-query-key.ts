import { computed } from 'vue';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';




interface AdminModeState {
    isAdminMode: true;
    workspaceId?: undefined;
}

interface WorkspaceModeState {
    isAdminMode: false;
    workspaceId: string;
}

type QueryKeyState = AdminModeState | WorkspaceModeState;


export const useQueryKeyAppContext = () => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
    const _workspaceId = computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId);

    return computed(() => {
        const state: QueryKeyState = _isAdminMode.value
            ? { isAdminMode: true }
            : {
                isAdminMode: false,
                // workspaceId: _state.workspaceId!
                workspaceId: _workspaceId.value ?? '',
            };

        return state.isAdminMode
            ? ['admin']
            : ['workspace', state.workspaceId];
    });
};
