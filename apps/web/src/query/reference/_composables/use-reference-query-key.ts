import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryKeyContextParams } from '@/query/_composables/use-query-key-context';
import { useQueryKeyContext } from '@/query/_composables/use-query-key-context';
import type { ReferenceQueryKey } from '@/query/reference/_types/reference-query-key-type';
import type { ReferenceResourceType } from '@/query/reference/_types/reference-resource-type';



/**
 * Composable that generates a reference query key with global parameters.
 * This hook creates a query key specifically for reference data, which is structured differently
 * from regular API query keys but still includes global parameters.
 *
 * @param resourceType - The type of reference resource (e.g., 'public-dashboard', 'project')
 * @param queryKeyOptions - Optional query key options to merge with default params
 * @returns A computed reference to the query key array, structured as `[QueryContext, resourceType]`
 *
 * ### Example Usage:
 * ```ts
 * // Basic usage
 * const referenceKey = useReferenceQueryKey('public-dashboard');
 *
 * // With additional params
 * const referenceKey = useReferenceQueryKey('public-dashboard', {
 *   workspaceId: 'custom-id',
 *   context: 'reference'
 * });
 * ```
 *
 * ### Features:
 * - **Reference Key Structure**: Creates a specialized key structure for reference data
 * - **Global Parameter Integration**: Automatically includes workspace and admin mode parameters
 * - **Type Safety**: Ensures valid reference resource types through TypeScript
 */
export const useReferenceQueryKey = (
    resourceType: ReferenceResourceType,
    queryKeyOptions?: Partial<QueryKeyContextParams>,
): ComputedRef<ReferenceQueryKey> => {
    const queryKeyContext = useQueryKeyContext({ ...queryKeyOptions, context: 'reference' });

    return computed(() => [
        queryKeyContext.value,
        resourceType,
    ]);
};
