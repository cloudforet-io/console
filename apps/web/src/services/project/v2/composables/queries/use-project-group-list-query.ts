import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useProjectGroupListQuery = () => {
    const { projectGroupAPI } = useProjectGroupApi();
    const { key: projectGroupListQueryKey, params } = useServiceQueryKey('identity', 'project-group', 'list');

    return useScopedQuery({
        queryKey: projectGroupListQueryKey,
        queryFn: () => projectGroupAPI.list(params.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['WORKSPACE']);
};
