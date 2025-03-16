import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { SERVICE_PREFIX } from '@/api-clients/_common/constants/query-key-constant';
import type {
    ResourceName, ServiceName, ServiceQueryKey, Verb,
} from '@/api-clients/_common/types/query-key-type';
import type { QueryKeyBaseParams } from '@/query/_composables/use-query-key-base';
import { useQueryKeyBase } from '@/query/_composables/use-query-key-base';

/**
 * Generates a computed query key for API requests, incorporating global parameters.
 *
 * @param service - The service name, representing the API service scope (e.g., 'dashboard').
 * @param resource - The resource name, specifying the target API resource (e.g., 'public-data-table').
 * @param verb - The API action verb, defining the type of request (e.g., 'get', 'list', 'update').
 * @param queryKeyOptions - Optional query key options to merge with default params
 * @returns A computed reference to the query key array, structured as `[SERVICE_PREFIX, service, resource, verb, { globalParams }]`.
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

export const useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>>(
    service: S,
    resource: R,
    verb: V,
    queryKeyOptions?: Partial<QueryKeyBaseParams>,
): ComputedRef<ServiceQueryKey<S, R, V>> => {
    const queryKeyBase = useQueryKeyBase(queryKeyOptions);

    return computed(() => [
        ...queryKeyBase.value,
        SERVICE_PREFIX,
        service,
        resource,
        verb,
    ]);
};
