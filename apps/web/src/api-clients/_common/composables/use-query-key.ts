import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

type QueryKey = Array<unknown>;

interface GlobalQueryParams {
    workspaceId?: string;
    isAdminMode?: boolean;
}

export const useQueryKey = (
    resourceKey: string,
    additionalGlobalParams?: Partial<GlobalQueryParams>,
): ComputedRef<QueryKey> => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        currentWorkdpaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });

    const globalQueryParams = reactive<GlobalQueryParams>({
        workspaceId: _state.currentWorkdpaceId,
        isAdminMode: _state.isAdminMode,
        ...additionalGlobalParams,
    });

    return computed(() => [resourceKey, { ...globalQueryParams }]);
};
