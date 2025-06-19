import type { QueryClient } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

import { useReferenceQueryKey } from '@/query/core/query-key/use-reference-query-key';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import type { ResourceCacheType, ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';



type MutationCallback<T> = () => Promise<T>;
type callbackForReferenceRefresh = () => Promise<void>;

export const useResourceCacheSync = <T extends Record<string, any>>(resourceType: ResourceKeyType) => {
    const queryClient = useQueryClient();

    const mutateWithResourceCacheUpdate = async (
        mutationCallback: MutationCallback<T>,
    ): Promise<T> => {
        const response = await mutationCallback();
        await _updateResourceCache<T>(resourceType, response, queryClient);
        return response;
    };

    const refreshResourceCache = async (
        mutationCallback: callbackForReferenceRefresh,
    ): Promise<void> => {
        await mutationCallback();
        const { key: referenceQueryKey } = useReferenceQueryKey(resourceType);
        await queryClient.invalidateQueries({ queryKey: referenceQueryKey.value });
    };

    return { mutateWithResourceCacheUpdate, refreshResourceCache };
};


const _updateResourceCache = async <T extends Record<string, any>>(
    resourceType: ResourceKeyType,
    newData: T,
    queryClient: QueryClient,
) => {
    const { key: referenceQueryKey, withSuffix } = useReferenceQueryKey(resourceType);

    const idKey = RESOURCE_CONFIG_MAP[resourceType].idKey;

    if (!idKey || typeof newData !== 'object' || newData === null || !(idKey in newData)) {
        throw new Error(`Invalid resource key or data for type: ${resourceType}`);
    }

    queryClient.setQueryData<ResourceCacheType<T>>(referenceQueryKey, (oldData: ResourceCacheType<T>|undefined) => {
        const currentResults = oldData ?? {};
        const newDataId = newData[idKey];

        if (newDataId in currentResults) {
            const updatedResults = { ...currentResults };
            updatedResults[newDataId] = newData;
            return updatedResults;
        }

        return {
            ...currentResults,
            [newDataId]: newData,
        };
    });
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: withSuffix('stat') }),
        queryClient.invalidateQueries({ queryKey: withSuffix('list') }),
    ]);
};
