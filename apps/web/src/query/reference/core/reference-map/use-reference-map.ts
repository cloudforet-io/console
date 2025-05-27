import {
    computed,
} from 'vue';

import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';
import { referenceConfigMap } from '@/query/reference/reference-config';
import type { ReferenceFetchInfo, ReferenceKeyType } from '@/query/reference/types/reference-type';

import type { ReferenceMap } from '@/store/reference/type';

import { useWatchedQueryCache } from '../common/use-watched-query-cache';
import { useBatchedReferenceFetch } from './use-batched-reference-fetch';

export const useReferenceMap = <T, R extends Record<string, any>>(
    resourceKey: ReferenceKeyType,
    fetchInfo: ReferenceFetchInfo<T>,
    transform: (item: T) => R,
) => {
    const _config = referenceConfigMap[resourceKey];

    if (!_config) {
        throw new Error(`Invalid reference key - map : ${resourceKey}`);
    }

    const { listFetchFn } = fetchInfo;
    const { key: queryKey } = useReferenceQueryKey(resourceKey);

    // Utills
    const getId = (item: T) => {
        if (!_config.idKey) {
            throw new Error(`[getId] Invalid resource key: ${resourceKey}`);
        }
        return item[_config.idKey];
    };
    const batchedFecher = async (ids: string[]) => {
        if (!_config.idKey) {
            throw new Error(`[batchedFetcher] Invalid resource key: ${resourceKey}`);
        }
        let params: any = {
            query: {
                filter: [
                    {
                        k: _config.idKey,
                        o: 'in',
                        v: ids,
                    },
                ],
            },
        };
        if (fetchInfo.only) {
            params = {
                ...params,
                query: {
                    ...params.query,
                    only: fetchInfo.only,
                },
            };
        }
        const response = await listFetchFn(params);
        return response.results || [];
    };

    // Core
    const { enqueue } = useBatchedReferenceFetch(
        queryKey.value,
        batchedFecher,
        getId,
    );
    const { data: cachedData } = useWatchedQueryCache<T[]>(queryKey.value);

    // Computed
    const _cachedMap = computed(() => (cachedData.value || []).reduce((acc, item) => {
        acc[getId(item as T)] = transform(item as T);
        return acc;
    }, {} as ReferenceMap<R>));


    const proxyMap = new Proxy({}, {
        get(_, id: string) {
            const cache = _cachedMap.value;
            if (!(id in cache)) enqueue(id);
            return cache[id];
        },
    });

    return {
        referenceMap: computed(() => proxyMap as ReferenceMap<R>),
    };
};
