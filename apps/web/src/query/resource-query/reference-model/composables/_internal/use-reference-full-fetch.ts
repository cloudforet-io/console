import { referenceQueryClient as queryClient } from '@/query/clients';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import type { ReferenceConfig } from '@/query/resource-query/reference-model/types/reference-type';
import { createResourceIdResolver } from '@/query/resource-query/reference-model/utils/reference-helper';
import { useResourceInfo } from '@/query/resource-query/shared/composable/use-resource-info';
import type { ResourceCacheType, ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';


export const useReferenceFullFetch = <T extends Record<string, any>>(
    resourceKey: ResourceKeyType,
    queryKey: QueryKeyArray,
    referenceConfig: ReferenceConfig<T>,
) => {
    const { api } = useResourceInfo(resourceKey);
    const { only } = referenceConfig;


    // Utills
    const getId = createResourceIdResolver<T>(resourceKey);

    const fullFetcher = async (): Promise<T[]> => {
        let params: any = {};
        if (only) {
            params = {
                query: {
                    only,
                },
            };
        }
        const response = await api.list(params);
        return (response.results as T[]) || [];
    };

    const fetcher = async () => {
        const results = await fullFetcher();
        const map: ResourceCacheType<T> = {};
        results.forEach((item) => {
            map[getId(item)] = item;
        });
        queryClient.setQueryData(queryKey, map);
    };


    return {
        fetcher,
    };
};
