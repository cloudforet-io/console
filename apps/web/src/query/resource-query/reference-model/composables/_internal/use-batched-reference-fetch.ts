import {
    ref,
} from 'vue';

import { referenceQueryClient as queryClient } from '@/query/clients';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import type { ReferenceConfig } from '@/query/resource-query/reference-model/types/reference-type';
import { createResourceIdResolver } from '@/query/resource-query/reference-model/utils/reference-helper';
import { useResourceInfo } from '@/query/resource-query/shared/composable/use-resource-info';
import type { ResourceKeyType, ResourceCacheType } from '@/query/resource-query/shared/types/resource-type';



const DEBOUNCE_MS = 300;
const BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 30;

export function useBatchedReferenceFetch<T extends Record<string, any>>(
    resourceKey: ResourceKeyType,
    queryKey: QueryKeyArray,
    referenceConfig: ReferenceConfig<T>,
) {
    const { config, api } = useResourceInfo(resourceKey);
    const { only } = referenceConfig;

    // Utills
    const getId = createResourceIdResolver<T>(resourceKey);

    const batchedFecher = async (ids: string[]): Promise<T[]> => {
        if (!config.idKey) {
            throw new Error(`[batchedFetcher] Invalid resource key: ${resourceKey}`);
        }
        let params: any = {
            query: {
                filter: [
                    {
                        k: config.idKey,
                        o: 'in',
                        v: ids,
                    },
                ],
            },
        };
        if (only) {
            params = {
                ...params,
                query: {
                    ...params.query,
                    only,
                },
            };
        }
        const response = await api.list(params);
        return response.results || [];
    };


    const pendingSet = ref(new Set<string>());
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const enqueue = (id: string) => {
        if (!id || pendingSet.value.has(id)) return;

        pendingSet.value.add(id);

        if (pendingSet.value.size >= BATCH_SIZE) {
            _triggerFetch();
        } else {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                _triggerFetch();
            }, DEBOUNCE_MS);
        }
    };

    const _triggerFetch = async () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }

        const idsToFetch = Array.from(pendingSet.value);
        pendingSet.value.clear();
        if (idsToFetch.length === 0) return;

        const cached = queryClient.getQueryData<ResourceCacheType<T>>(queryKey) || {};
        const cachedIds = new Set(Object.keys(cached));
        const ids = idsToFetch.filter((id) => !cachedIds.has(id));

        const chunks = _chunkArray(ids, MAX_BATCH_SIZE);

        const fetchedArrays = await Promise.all(chunks.map(batchedFecher));
        const fetched = fetchedArrays.flat();

        const uniqueFetched = fetched.filter((item) => !cachedIds.has(getId(item)));
        const merged = { ...cached };
        uniqueFetched.forEach((item) => {
            merged[getId(item)] = item;
        });
        queryClient.setQueryData(queryKey, merged);
        uniqueFetched.forEach((item) => cachedIds.add(getId(item)));
    };

    return {
        fetcher: enqueue,
    };
}

const _chunkArray = (array: string[], size: number): string[][] => Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
