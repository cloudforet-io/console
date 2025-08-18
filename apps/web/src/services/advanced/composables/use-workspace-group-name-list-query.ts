import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceGroupNameListQuery = () => {
    const { workspaceGroupAPI } = useWorkspaceGroupApi();
    const { key, params } = useServiceQueryKey('identity', 'workspace-group', 'list', {
        params: {
            query: { only: ['workspace_group_id', 'name'] },
        },
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => workspaceGroupAPI.list(params.value),
        select: (data) => (data?.results || []).map((item) => item.name),
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['DOMAIN']);
};
