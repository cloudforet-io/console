import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type {
    ResourceName, ServiceName, ServiceQueryKey, Verb,
} from '@/api-clients/_common/types/query-key-type';
import type { QueryKeyContextParams } from '@/query/_composables/use-query-key-context';
import { useQueryKeyContext } from '@/query/_composables/use-query-key-context';

/**
 * Generates a computed query key for API requests, incorporating global parameters.
 *
 * @param service - The service name, representing the API service scope (e.g., 'dashboard').
 * @param resource - The resource name, specifying the target API resource (e.g., 'public-data-table').
 * @param verb - The API action verb, defining the type of request (e.g., 'get', 'list', 'update').
 * @param queryKeyOptions - Optional query key options to merge with default params
 * @returns A computed reference to the query key array, structured as `[QueryContext, service, resource, verb]`
 *
 * ### Example Usage:
 * ```ts
 * // Basic usage
 * const queryKey = useAPIQueryKey('dashboard', 'public-data-table', 'get');
 *
 * // With additional params
 * const queryKey = useAPIQueryKey('dashboard', 'public-data-table', 'get', {
 *   workspaceId: 'custom-id',
 *   isAdminMode: true
 * });
 * ```
 *
 * The generated query key ensures:
 * - **Type safety**: Prevents invalid API calls by enforcing a valid `service/resource/verb` combination
 * - **Auto-completion**: Provides intelligent suggestions based on predefined API structure
 * - **Cache management**: Enables precise cache invalidation and data synchronization
 */

export const useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>>(
    service: S,
    resource: R,
    verb: V,
    queryKeyOptions?: Partial<QueryKeyContextParams>,
): ComputedRef<ServiceQueryKey<S, R, V>> => {
    const queryKeyContext = useQueryKeyContext({ ...queryKeyOptions, context: 'service' });

    return computed(() => [
        queryKeyContext.value,
        service,
        resource,
        verb,
    ]);
};
