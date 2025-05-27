import type { QueryClient } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';
import { referenceConfigMap } from '@/query/reference/reference-config';
import type { ReferenceKeyType } from '@/query/reference/types/reference-type';



type MutationCallback<T> = () => Promise<T>;
type callbackForReferenceRefresh = () => Promise<void>;

export const useReferenceModelSync = <T>(resourceType: ReferenceKeyType) => {
    const queryClient = useQueryClient();

    const withReferenceUpdate = async (
        mutationCallback: MutationCallback<T>,
    ): Promise<T> => {
        const response = await mutationCallback();
        await _updateReferenceCache<T>(resourceType, response, queryClient);
        return response;
    };

    const withReferenceRefresh = async (
        mutationCallback: callbackForReferenceRefresh,
    ): Promise<void> => {
        await mutationCallback();
        const { key: referenceQueryKey } = useReferenceQueryKey(resourceType);
        await queryClient.invalidateQueries({ queryKey: referenceQueryKey.value });
    };

    return { withReferenceUpdate, withReferenceRefresh };
};


const _updateReferenceCache = async <T>(
    resourceType: ReferenceKeyType,
    newData: T,
    queryClient: QueryClient,
) => {
    const { key: referenceQueryKey, withSuffix } = useReferenceQueryKey(resourceType);

    const idKey = referenceConfigMap[resourceType].idKey;

    if (!idKey || !newData[idKey]) {
        throw new Error(`Invalid resource key or data for type: ${resourceType}`);
    }

    queryClient.setQueryData<T[]>(referenceQueryKey, (oldData: T[] | undefined) => {
        const currentResults = oldData ?? [];

        if (newData == null) {
            return oldData;
        }

        const existingItemIndex = currentResults.findIndex(
            (item) => item?.[idKey] === newData[idKey],
        );

        if (existingItemIndex > -1) {
            const updatedResults = [...currentResults];
            updatedResults[existingItemIndex] = newData;
            return updatedResults;
        }

        return [...currentResults, newData];
    });

    queryClient.invalidateQueries({ queryKey: withSuffix('stat') });
    queryClient.invalidateQueries({ queryKey: withSuffix('list') });
};
