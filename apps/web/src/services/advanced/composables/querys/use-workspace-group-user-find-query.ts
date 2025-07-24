import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupUserFindParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/find';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseWorkspaceGroupUserFindQueryOptions {
    params: ComputedRef<WorkspaceGroupUserFindParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useWorkspaceGroupUserFindQuery = ({ params, enabled }: UseWorkspaceGroupUserFindQueryOptions) => {
    if (!params.value.workspace_group_id) {
        ErrorHandler.handleError(new Error('workspace_group_id is required'));
    }

    const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();

    const { key: workspaceGroupUserFindQueryKey, params: workspaceGroupUserFindQueryParams } = useServiceQueryKey('identity', 'workspace-group-user', 'find', {
        params,
    });

    return useScopedQuery({
        queryKey: workspaceGroupUserFindQueryKey,
        queryFn: async () => workspaceGroupUserAPI.find(workspaceGroupUserFindQueryParams.value),
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.results ?? [],
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN']);
};
