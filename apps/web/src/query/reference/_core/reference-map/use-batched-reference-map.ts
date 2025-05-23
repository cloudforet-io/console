import {
    computed,
} from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';
import type { ReferenceKeyType } from '@/query/reference/types/reference-type';

import type { ReferenceMap } from '@/store/reference/type';

import { REFRENCE_KEY_MAP } from '../../constants/reference-constant';
import { useWatchedQueryCache } from '../common/use-watched-query-cache';
import { useBatchedReferenceFetch } from './use-batched-reference-fetch';

interface BatchedLazyReferenceOptions {
  debounceMs?: number;
  batchSize?: number;
  maxBatchSize?: number;
}

export const useBatchedReferenceMap = <T, R extends Record<string, any>>(
    resourceKey: ReferenceKeyType,
    queryKey: QueryKeyArray,
    listFetchFn: (params: any) => Promise<ListResponse<T>>,
    transform: (item: T) => R,
    options?: BatchedLazyReferenceOptions,
) => {
    // Utills
    const getId = (item: T) => {
        if (!REFRENCE_KEY_MAP[resourceKey]) {
            throw new Error(`[getId] Invalid resource key: ${resourceKey}`);
        }
        const idKey = REFRENCE_KEY_MAP[resourceKey].idKey;

        return item[idKey];
    };
    const batchedFecher = async (ids: string[]) => {
        if (!REFRENCE_KEY_MAP[resourceKey]) {
            throw new Error(`[batchedFetcher] Invalid resource key: ${resourceKey}`);
        }
        const idKey = REFRENCE_KEY_MAP[resourceKey].idKey;

        const params = {
            query: {
                filter: [
                    {
                        k: idKey,
                        o: 'in',
                        v: ids,
                    },
                ],
            },
        };
        const response = await listFetchFn(params);
        return response.results || [];
    };

    // Core
    const { enqueue } = useBatchedReferenceFetch(
        queryKey,
        batchedFecher,
        getId,
        options,
    );
    const { data: cachedData } = useWatchedQueryCache<T[]>(queryKey);

    // Computed
    const _cachedMap = computed(() => (cachedData.value || []).reduce((acc, item) => {
        acc[getId(item)] = transform(item);
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
