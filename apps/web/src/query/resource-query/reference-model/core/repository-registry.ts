
import type { QueryClient } from '@tanstack/query-core';

import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import ReferenceRepository from '@/query/resource-query/reference-model/core/reference-repository';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';

const repositoryRegistry = new Map<string, ReferenceRepository<any>>();


export const getRepository = <T extends Record<string, any>>(
    resourceKey: ResourceKeyType,
    queryClient: QueryClient,
    queryKey: QueryKeyArray,
    listFetcher: (params: any) => Promise<ListResponse<T>>,
    listQuery?: Query,
): ReferenceRepository<T> => {
    if (!repositoryRegistry.has(JSON.stringify(queryKey))) {
        if (import.meta.env.DEV) {
            console.log(`Creating new Reference Repository for QueryKey: ${JSON.stringify(queryKey)}`);
        }
        const repository = new ReferenceRepository<T>(
            resourceKey,
            queryClient,
            queryKey,
            listFetcher,
            listQuery,
        );
        repositoryRegistry.set(JSON.stringify(queryKey), repository);
    }
    return repositoryRegistry.get(JSON.stringify(queryKey)) as ReferenceRepository<T>;
};
