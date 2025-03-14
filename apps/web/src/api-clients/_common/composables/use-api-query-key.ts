import { computed } from 'vue';

import type {
    ResourceName, ServiceName, Verb,
} from '@/api-clients/_common/types/query-key-type';

import { SERVICE_PREFIX } from '../constants/query-key-constant';
import type { GlobalQueryParams } from './use-global-query-params';
import { useGlobalQueryParams } from './use-global-query-params';

/**
 * Generates a computed query key for API requests, incorporating global parameters.
 *
 * @param service - The service name, representing the API service scope (e.g., 'dashboard').
 * @param resource - The resource name, specifying the target API resource (e.g., 'public-data-table').
 * @param verb - The API action verb, defining the type of request (e.g., 'get', 'list', 'update').
 * @param additionalGlobalParams - Optional additional global parameters (e.g., workspace ID, admin mode).
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
    additionalGlobalParams?: Partial<GlobalQueryParams>,
) => {
    const globalQueryParams = useGlobalQueryParams(additionalGlobalParams);

    return computed(() => [
        SERVICE_PREFIX,
        service,
        resource,
        verb,
        { ...globalQueryParams.value },
    ]);
};
