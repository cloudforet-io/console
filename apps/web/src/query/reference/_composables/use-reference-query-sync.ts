import type { QueryClient } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { QueryKeyArray } from '@/query/_types/query-key-type';
import { useReferenceQueryKey } from '@/query/reference/_composables/use-reference-query-key';
import { REFERENCE_TYPE_INFO_MAP } from '@/query/reference/_constants/reference-type-map';


type MutationCallback<T> = () => Promise<T>;

export const useReferenceQuerySync = <T>(resourceType: keyof typeof REFERENCE_TYPE_INFO_MAP) => {
    const queryClient = useQueryClient();

    const withReferenceUpdate = async (
        mutationCallback: MutationCallback<T>,
    ): Promise<T> => {
        const response = await mutationCallback();
        const referenceQueryKey = useReferenceQueryKey();
        const queryKey = referenceQueryKey.value[resourceType];
        await updateReferenceCache<T>(queryClient, queryKey, response, resourceType);
        return response;
    };

    const withReferenceRefresh = async (
        mutationCallback: MutationCallback<T>,
    ): Promise<void> => {
        await mutationCallback();
        const referenceQueryKey = useReferenceQueryKey();
        const queryKey = referenceQueryKey.value[resourceType];
        await queryClient.invalidateQueries({ queryKey });
    };

    return { withReferenceUpdate, withReferenceRefresh };
};


const updateReferenceCache = async <T>(
    queryClient: QueryClient,
    queryKey: QueryKeyArray,
    newData: T,
    resourceType: keyof typeof REFERENCE_TYPE_INFO_MAP,
) => {
    const resourceKey = REFERENCE_TYPE_INFO_MAP[resourceType].key;

    if (!resourceKey || !newData[resourceKey]) {
        throw new Error(`Invalid resource key or data for type: ${resourceType}`);
    }

    queryClient.setQueryData<ListResponse<T>>(queryKey, (oldData: ListResponse<T> | undefined) => {
        const currentResults = oldData?.results ?? [];

        if (newData == null) {
            return oldData;
        }

        const existingItemIndex = currentResults.findIndex(
            (item) => item?.[resourceKey] === newData[resourceKey],
        );

        if (existingItemIndex > -1) {
            const updatedResults = [...currentResults];
            updatedResults[existingItemIndex] = newData;
            return { results: updatedResults };
        }

        return {
            results: [...currentResults, newData],
        };
    });
};






