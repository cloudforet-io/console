import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import type { QueryKeyBase } from '@/query/_types/query-key-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


/**
 * Interface for global query parameters used across API requests.
 * These parameters are automatically included in API and reference query keys.
 */
export interface QueryKeyBaseParams {
    /** Flag indicating whether admin mode is enabled */
    isAdminMode?: boolean;
    /** Current workspace ID from the workspace context */
    workspaceId?: string;
    /** Additional parameters that might be added */
    [key: string]: any;
}

/**
 * Composable that manages global query parameters with reactive state.
 * This hook centralizes the management of workspace and admin mode parameters
 * that are commonly used across different API queries.
 *
 * @param queryKeyOptions - Optional query key options to merge with default params
 * @returns A computed reference containing the combined global query parameters as an ordered array
 *
 * ### Example Usage:
 * ```ts
 * const queryKeyBase = useQueryKeyBase();
 * // Access params (now returns array)
 * const [mode, workspaceId, others] = queryKeyBase.value;
 *
 * // With additional params
 * const params = useQueryKeyBase({ customParam: 'value' });
 * ```
 *
 * ### Features:
 * - **Ordered Parameters**: Guarantees consistent parameter order: [mode, workspaceId, others]
 * - **Reactive State**: Automatically updates when workspace or admin mode changes
 * - **Parameter Merging**: Allows adding custom parameters in the others object
 */
export const useQueryKeyBase = (queryKeyOptions?: Partial<QueryKeyBaseParams>): ComputedRef<QueryKeyBase> => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    return computed<QueryKeyBase>(() => {
        const { isAdminMode, workspaceId: _workspaceId, ...otherParams } = queryKeyOptions || {};
        const mode = (isAdminMode || _state.isAdminMode) ? 'ADMIN' : 'WORKSPACE';
        const workspaceId = _workspaceId || _state.currentWorkspaceId;

        return [
            mode,
            workspaceId,
            Object.keys(otherParams).length > 0 ? otherParams : undefined,
        ];
    });
};
