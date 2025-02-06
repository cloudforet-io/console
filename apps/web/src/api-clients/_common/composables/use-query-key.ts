import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';


import type { QueryKey } from '@tanstack/vue-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

/**
 * Generates a computed query key for API requests, incorporating global parameters.
 *
 * @param primaryQueryKey - The primary key for the api query (e.g., 'private-dashboard/get'). It follows the `{api-resource-name}/{api-verb}` convention.
 * @param additionalGlobalParams - Optional additional global parameters to include in the api query key.
 * @returns A computed reference to the query key array.
 */

interface GlobalQueryParams {
    workspaceId?: string;
    isAdminMode?: boolean;
}
export const useAPIQueryKey = (
    primaryQueryKey: string,
    additionalGlobalParams?: Partial<GlobalQueryParams>,
): ComputedRef<QueryKey> => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        currentWorkdpaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    });

    const globalQueryParams = reactive<GlobalQueryParams>({
        workspaceId: _state.currentWorkdpaceId,
        isAdminMode: _state.isAdminMode,
        ...additionalGlobalParams,
    });

    return computed<QueryKey>(() => [primaryQueryKey, { ...globalQueryParams }]);
};
