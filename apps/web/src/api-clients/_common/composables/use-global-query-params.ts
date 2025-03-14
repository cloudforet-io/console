import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

/**
 * Interface for global query parameters used across API requests.
 * These parameters are automatically included in API and reference query keys.
 */
export interface GlobalQueryParams {
    /** Current workspace ID from the workspace context */
    workspaceId?: string;
    /** Flag indicating whether admin mode is enabled */
    isAdminMode?: boolean;
}

/**
 * Composable that manages global query parameters with reactive state.
 * This hook centralizes the management of workspace and admin mode parameters
 * that are commonly used across different API queries.
 *
 * @param additionalGlobalParams - Optional additional global parameters to merge with default params
 * @returns A computed reference containing the combined global query parameters
 *
 * ### Example Usage:
 * ```ts
 * const globalParams = useGlobalQueryParams();
 * // Access params
 * console.log(globalParams.value.workspaceId);
 * console.log(globalParams.value.isAdminMode);
 *
 * // With additional params
 * const params = useGlobalQueryParams({ workspaceId: 'custom-id' });
 * ```
 *
 * ### Features:
 * - **Reactive State**: Automatically updates when workspace or admin mode changes
 * - **Parameter Merging**: Allows overriding default params with custom values
 * - **Type Safety**: Provides TypeScript interfaces for parameter validation
 */
export const useGlobalQueryParams = (additionalGlobalParams?: Partial<GlobalQueryParams>): ComputedRef<GlobalQueryParams> => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    });

    const globalQueryParams = reactive<GlobalQueryParams>({
        workspaceId: _state.currentWorkspaceId,
        isAdminMode: _state.isAdminMode,
        ...additionalGlobalParams,
    });

    return computed(() => ({ ...globalQueryParams }));
};
