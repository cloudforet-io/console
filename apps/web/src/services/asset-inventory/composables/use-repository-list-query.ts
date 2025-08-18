import { type ComputedRef } from 'vue';

import { useRepositoryApi } from '@/api-clients/repository/repository/composables/use-repository-api';
import type { RepositoryListParameters } from '@/api-clients/repository/repository/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useRepositoryListQuery = (params?: ComputedRef<RepositoryListParameters>) => {
    const { repositoryAPI } = useRepositoryApi();
    const { key, params: repositoryParams } = useServiceQueryKey('repository', 'repository', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: async () => repositoryAPI.list(repositoryParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
