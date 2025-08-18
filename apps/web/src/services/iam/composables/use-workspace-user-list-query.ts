import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceUserListQuery = () => {
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const { key: workspaceUserListKey } = useServiceQueryKey('identity', 'workspace-user', 'list');
    return useScopedQuery({
        queryKey: workspaceUserListKey,
        queryFn: () => workspaceUserAPI.list({}),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['WORKSPACE']);
};
