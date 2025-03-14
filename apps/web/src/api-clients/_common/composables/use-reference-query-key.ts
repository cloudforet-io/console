import { computed } from 'vue';

import { getReferencePrimaryQueryKey } from '@/query/reference/helper';
import type { ReferenceResourceType } from '@/query/reference/type';

import type { GlobalQueryParams } from './use-global-query-params';
import { useGlobalQueryParams } from './use-global-query-params';

/**
 * Composable that generates a reference query key with global parameters.
 * This hook creates a query key specifically for reference data, which is structured differently
 * from regular API query keys but still includes global parameters.
 *
 * @param resourceType - The type of reference resource (e.g., 'public-dashboard', 'project')
 * @param additionalGlobalParams - Optional additional global parameters to include in the query key
 * @returns A computed reference to the query key array, structured as `[REFERENCE_PREFIX, ...referencePrimaryKey, { globalParams }]`
 *
 * ### Example Usage:
 * ```ts
 * // Basic usage
 * const referenceKey = useReferenceQueryKey('public-dashboard');
 *
 * // With additional params
 * const referenceKey = useReferenceQueryKey('public-dashboard', { workspaceId: 'custom-id' });
 * ```
 *
 * ### Features:
 * - **Reference Key Structure**: Creates a specialized key structure for reference data
 * - **Global Parameter Integration**: Automatically includes workspace and admin mode parameters
 * - **Type Safety**: Ensures valid reference resource types through TypeScript
 */
export const useReferenceQueryKey = (
    resourceType: ReferenceResourceType,
    additionalGlobalParams?: Partial<GlobalQueryParams>,
) => {
    const globalQueryParams = useGlobalQueryParams(additionalGlobalParams);

    return computed(() => [
        ...getReferencePrimaryQueryKey(resourceType),
        { ...globalQueryParams.value },
    ]);
};
