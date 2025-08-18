import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useAdminDashboardInitialWorkspaceFilter = () => {
    const { workspaceAPI } = useWorkspaceApi();
    const { key, params } = useServiceQueryKey('identity', 'workspace', 'list', {
        params: {
            query: {
                page: {
                    start: 1,
                    limit: 1,
                },
                filter: [
                    { k: 'is_dormant', v: false, o: 'eq' },
                ],
            },
        } as WorkspaceListParameters,
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => workspaceAPI.list(params.value),
        select: (d) => d.results?.[0],
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['DOMAIN']);
};
