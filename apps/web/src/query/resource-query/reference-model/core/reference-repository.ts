import type { QueryClient } from '@tanstack/query-core';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import IdBatcher from '@/query/core/uitils/id-batcher';
import { createResourceIdResolver } from '@/query/resource-query/reference-model/utils/reference-helper';
import type { ResourceCacheType, ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';



class ReferenceRepository<T extends Record<string, any>> {
    private resourceKey: ResourceKeyType;

    private idKey: string;

    private queryClient: QueryClient;

    private queryKey: QueryKeyArray;

    private listFetcher: (params: any) => Promise<ListResponse<T>>;

    private idBatcher: IdBatcher;

    private getId: (item: T) => string;

    constructor(
        resourceKey: ResourceKeyType,
        queryClient: QueryClient,
        queryKey: QueryKeyArray,
        idKey: string,
        listFetcher: (params: any) => Promise<ListResponse<T>>,
    ) {
        this.resourceKey = resourceKey;
        this.queryClient = queryClient;
        this.queryKey = queryKey;
        this.idKey = idKey;
        this.listFetcher = listFetcher;
        this.idBatcher = new IdBatcher(this.fetchAndCache, {
            batchSize: 15,
            debounceMs: 300,
            maxBatchSize: 45,
        });
        this.getId = createResourceIdResolver<T>(resourceKey);
    }


    private async fetchAndCache(ids: string[]) {
        const cached = this.queryClient.getQueryData<ResourceCacheType<T>>(this.queryKey) ?? {};
        const cachedIds = new Set(Object.keys(cached));
        const idsToFetch = ids.filter((id) => !cachedIds.has(id));

        if (idsToFetch.length === 0) return;


        try {
            const params = {
                query: {
                    filters: [{ k: this.idKey, o: 'in', v: idsToFetch }],
                },
            };
            const { results } = await this.listFetcher(params);
            if (!results) return;

            this.queryClient.setQueryData<ResourceCacheType<T>>(this.queryKey, (oldData = {}) => {
                const newData = { ...oldData };
                results.forEach((item) => {
                    const itemId = item[this.idKey];
                    if (itemId) {
                        newData[itemId] = item;
                    }
                });
                return newData;
            });
        } catch (e) {
            console.error(`[ReferenceRepository] Failed to fetch batch for ${this.resourceKey}`, e);
        }
    }
}

export default ReferenceRepository;
