import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceGroupListQuery = () => {
    const { workspaceGroupAPI } = useWorkspaceGroupApi();

    const { key: workspaceGroupListQueryKey, params: workspaceGroupListQueryParams } = useServiceQueryKey('identity', 'workspace-group', 'list');

    return useScopedQuery({
        queryKey: workspaceGroupListQueryKey,
        queryFn: async () => workspaceGroupAPI.list(workspaceGroupListQueryParams.value),
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        enabled: true,
    }, ['DOMAIN']);
};
