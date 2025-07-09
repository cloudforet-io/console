import type { QueryClient } from '@tanstack/query-core';

import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import IdBatcher from '@/query/resource-query/reference-model/core/id-batcher';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import type { ResourceCacheType, ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';




class ReferenceRepository<T extends Record<string, any>> {
    private resourceKey: ResourceKeyType;

    private idKey: string;

    private queryClient: QueryClient;

    private queryKey: QueryKeyArray;

    private listFetcher: (params: any) => Promise<ListResponse<T>>;

    private listQuery: Query;

    private idBatcher: IdBatcher;


    constructor(
        resourceKey: ResourceKeyType,
        queryClient: QueryClient,
        queryKey: QueryKeyArray,
        listFetcher: (params: any) => Promise<ListResponse<T>>,
        listQuery?: Query,
    ) {
        this.resourceKey = resourceKey;
        this.queryClient = queryClient;
        this.queryKey = queryKey;
        this.idKey = RESOURCE_CONFIG_MAP[resourceKey].idKey;
        this.listFetcher = listFetcher;
        this.listQuery = listQuery ?? {};
        this.idBatcher = new IdBatcher(this.getFetchAndCache(), {
            batchSize: 15,
            debounceMs: 300,
            maxBatchSize: 45,
        });
    }

    private getFetchAndCache() {
        const _queryClient = this.queryClient;
        const _queryKey = this.queryKey;

        return async (ids: string[]) => {
            const cached = _queryClient.getQueryData<ResourceCacheType<T>>(_queryKey) ?? {};
            const cachedIds = new Set(Object.keys(cached));
            const idsToFetch = ids.filter((id) => !cachedIds.has(id));

            if (idsToFetch.length === 0) return;

            try {
                const params = {
                    query: {
                        ...this.listQuery,
                        filter: [
                            ...(this.listQuery?.filter ?? []),
                            { k: this.idKey, o: 'in', v: idsToFetch },
                        ],
                    },
                };
                const { results } = await this.listFetcher(params);
                if (!results) return;

                _queryClient.setQueryData<ResourceCacheType<T>>(_queryKey, (oldData = {}) => {
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
        };
    }

    requestItem(id: string) {
        if (this.queryClient.getQueryData<ResourceCacheType<T>>(this.queryKey)?.[id]) return;
        this.idBatcher.enqueue(id);
    }
}

export default ReferenceRepository;
