import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupUserListParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceGroupUserListQueryOptions {
    params: ComputedRef<WorkspaceGroupUserListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useWorkspaceGroupUserListQuery = ({ params, enabled }: UseWorkspaceGroupUserListQueryOptions) => {
    const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();

    const { key: workspaceGroupListUserQueryKey, params: workspaceGroupListUserQueryParams } = useServiceQueryKey('identity', 'workspace-group-user', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: workspaceGroupListUserQueryKey,
        queryFn: async () => workspaceGroupUserAPI.list(workspaceGroupListUserQueryParams.value),
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.results?.[0]?.users ?? [],
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN']);
};
