import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


/**
 * Interface for global query parameters used across API requests.
 * These parameters are automatically included in API and reference query keys.
 */
export type QueryScope = 'service' | 'reference';

export interface QueryKeyContextParams {
    isAdminMode?: boolean;
    workspaceId?: string;
    scope: QueryScope;
}

export interface QueryContext {
    mode: 'admin' | 'workspace';
    workspaceId?: string;
    scope: QueryScope;
}

/**
 * Composable that manages global query parameters with reactive state.
 * This hook centralizes the management of workspace and admin mode parameters
 * that are commonly used across different API queries.
 *
 * @param queryKeyOptions - Optional query key options to merge with default params
 * @returns A computed reference containing the combined global query parameters as a QueryContext object
 *
 * ### Example Usage:
 * ```ts
 * const queryContext = useQueryKeyContext({ context: 'service' });
 * // Access params
 * const { mode, workspaceId, context } = queryContext.value;
 *
 * // With additional params
 * const params = useQueryKeyContext({
 *   context: 'service',
 *   isAdminMode: true,
 *   workspaceId: 'custom-id'
 * });
 * ```
 *
 * ### Features:
 * - **Structured Context**: Returns a QueryContext object with mode, workspaceId, and context
 * - **Reactive State**: Automatically updates when workspace or admin mode changes
 * - **Type Safety**: Ensures context is always provided with valid values
 */
export const useQueryKeyContext = (queryKeyOptions: QueryKeyContextParams): ComputedRef<QueryContext> => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    return computed<QueryContext>(() => {
        const {
            isAdminMode, workspaceId: _workspaceId, scope,
        } = queryKeyOptions || {};
        const mode = (isAdminMode || _state.isAdminMode) ? 'admin' : 'workspace';
        const workspaceId = _workspaceId || _state.currentWorkspaceId;

        return {
            mode,
            workspaceId,
            scope,
        };
    });
};


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

