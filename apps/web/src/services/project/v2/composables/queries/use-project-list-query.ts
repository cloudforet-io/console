import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useProjectListQuery = () => {
    const { projectAPI } = useProjectApi();
    const { key: projectListQueryKey, params } = useServiceQueryKey('identity', 'project', 'list');

    return useScopedQuery({
        queryKey: projectListQueryKey,
        queryFn: () => projectAPI.list(params.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['WORKSPACE']);
};
