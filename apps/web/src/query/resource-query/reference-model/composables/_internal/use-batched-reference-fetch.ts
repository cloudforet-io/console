import type { ComputedRef } from 'vue';
import {
    ref,
} from 'vue';

import { referenceQueryClient as queryClient } from '@/query/clients';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import type { ReferenceDataModelFetchConfig } from '@/query/resource-query/reference-model/types/reference-type';
import { createResourceIdResolver } from '@/query/resource-query/reference-model/utils/reference-helper';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import type { ResourceKeyType, ResourceCacheType } from '@/query/resource-query/shared/types/resource-type';


/*
* DEBOUNCE_MS : Minimum wait time (ms) before triggering fetch after the last enqueue call
* BATCH_SIZE : Minimum number of IDs to accumulate before triggering an immediate fetch
* MAX_BATCH_SIZE : Maximum number of IDs to include in a single fetch batch
* */
const DEBOUNCE_MS = 300;
const BATCH_SIZE = 15;
const MAX_BATCH_SIZE = 45;

export function useBatchedReferenceFetch<T extends Record<string, any>>(
    resourceKey: ResourceKeyType,
    queryKey: ComputedRef<QueryKeyArray>,
    fetchConfig: ReferenceDataModelFetchConfig<T>,
) {
    const resourceConfig = RESOURCE_CONFIG_MAP[resourceKey];
    const listFetcher = fetchConfig.listFetcher;
    const { only = [] } = fetchConfig.query || {};
    const getId = createResourceIdResolver<T>(resourceKey);

    const batchedFetcher = async (ids: string[]): Promise<T[]> => {
        if (!resourceConfig.idKey) {
            throw new Error(`[batchedFetcher] Invalid resource key: ${resourceKey}`);
        }
        let params: any = {
            query: {
                filter: [
                    {
                        k: resourceConfig.idKey,
                        o: 'in',
                        v: ids,
                    },
                ],
            },
        };
        if (only && only.length > 0) {
            params = {
                ...params,
                query: {
                    ...params.query,
                    only,
                },
            };
        }
        const response = await listFetcher(params);
        return response?.results || [];
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

        const cached = queryClient.getQueryData<ResourceCacheType<T>>(queryKey.value) || {};
        const cachedIds = new Set(Object.keys(cached));
        const ids = idsToFetch.filter((id) => !cachedIds.has(id));

        const chunks = _chunkArray(ids, MAX_BATCH_SIZE);

        const fetchedArrays = await Promise.all(chunks.map(batchedFetcher));
        const fetched = fetchedArrays.flat();

        const uniqueFetched = fetched.filter((item) => !cachedIds.has(getId(item)));
        const merged = { ...cached };
        uniqueFetched.forEach((item) => {
            merged[getId(item)] = item;
        });
        queryClient.setQueryData(queryKey.value, merged);
    };

    return {
        fetcher: enqueue,
    };
}

const _chunkArray = (array: string[], size: number): string[][] => Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
