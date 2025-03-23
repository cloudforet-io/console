import { computed, reactive } from 'vue';

import type { QueryScope } from '@/query/_types/query-key-type';

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


export const useQueryKeyAppContext = (queryScope: QueryScope = 'service') => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        workspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    return computed(() => {
        const state: QueryKeyState = _state.isAdminMode
            ? { isAdminMode: true }
            : {
                isAdminMode: false,
                // workspaceId: _state.workspaceId!
                workspaceId: _state.workspaceId ?? '',
            };

        return state.isAdminMode
            ? [queryScope, 'admin']
            : [queryScope, 'workspace', state.workspaceId];
    });
};
