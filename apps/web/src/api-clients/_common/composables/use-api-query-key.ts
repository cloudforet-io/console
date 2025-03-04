import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';


import type { QueryKey } from '@tanstack/vue-query';

import type {
    ResourceName, ServiceName, Verb,
} from '@/api-clients/_common/types/query-key-type';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

/**
 * Generates a computed query key for API requests, incorporating global parameters.
 *
 * @param service - The service name, representing the API service scope (e.g., 'dashboard').
 * @param resource - The resource name, specifying the target API resource (e.g., 'public-data-table').
 * @param verb - The API action verb, defining the type of request (e.g., 'get', 'list', 'update').
 * @param additionalGlobalParams - Optional additional global parameters (e.g., workspace ID, admin mode).
 * @returns A computed reference to the query key array, structured as `[service, resource, verb, { globalParams }]`.
 *
 * ### Example Usage:
 * ```ts
 *  const queryKey = useAPIQueryKey('dashboard', 'public-data-table', 'get');
 * ```
 * The generated query key ensures:
 * - **Type safety**: Prevents invalid API calls by enforcing a valid `service/resource/verb` combination.
 * - **Auto-completion**: Provides intelligent suggestions based on predefined API structure.
 * - **Cache management**: Enables precise cache invalidation and data synchronization.
 */

interface GlobalQueryParams {
    workspaceId?: string;
    isAdminMode?: boolean;
}
export const useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>>(
    service: S,
    resource: R,
    verb: V,
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

    return computed<QueryKey>(() => [service, resource, verb, { ...globalQueryParams }]);
};
