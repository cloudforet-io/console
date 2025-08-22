import { resourceQueryClient as queryClient } from '@/query/clients';
import { useResourceQueryKey } from '@/query/core/query-key/use-resource-query-key';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';



type AnyFn = (...args: any[]) => any;
type AwaitedRet<F extends AnyFn> = Awaited<ReturnType<F>>;


export const useResourceCacheSync = (resourceType: ResourceKeyType) => {
    const wrapResourceCacheRefresh = <F extends AnyFn>(fn: F) => async (...args: Parameters<F>): Promise<AwaitedRet<F>> => {
        const { key: referenceQueryKey } = useResourceQueryKey(resourceType);
        try {
            const res = await fn(...args);
            return res;
        } finally {
            await queryClient.invalidateQueries({ queryKey: referenceQueryKey.value });
        }
    };

    // TODO: annotaion
    // const wrapResourceCacheUpdate = <F extends AnyFn>(fn: F) => async (...args: Parameters<F>): Promise<AwaitedRet<F>> => {
    //     const res = await Promise.resolve(fn(...args));
    //     await _updateResourceCache(resourceType, res as Obj, queryClient);
    //     return res;
    // };

    return {
        wrapResourceCacheRefresh,
        // wrapResourceCacheUpdate,
    };
};


// const _updateResourceCache = async <T extends Obj>(
//     resourceType: ResourceKeyType,
//     newData: T,
//     queryClient: QueryClient,
// ) => {
//     const { key: referenceQueryKey, withSuffix } = useResourceQueryKey(resourceType);
//     const idKey = RESOURCE_CONFIG_MAP[resourceType].idKey as keyof T;

//     if (!idKey || typeof newData !== 'object' || newData === null || !(idKey in newData)) {
//         throw new Error(`Invalid resource key or data for type: ${resourceType}`);
//     }

//     queryClient.setQueryData<ResourceCacheType<T>>(referenceQueryKey.value, (oldData) => {
//         const currentResults = (oldData ?? {}) as ResourceCacheType<T>;
//         const newDataId = newData[idKey] as PropertyKey;

//         if (newDataId in currentResults) {
//             return { ...currentResults, [newDataId]: newData };
//         }
//         return { ...currentResults, [newDataId]: newData };
//     });

//     await Promise.all([
//         queryClient.invalidateQueries({ queryKey: withSuffix('stat') }),
//         queryClient.invalidateQueries({ queryKey: withSuffix('list') }),
//     ]);
// };
