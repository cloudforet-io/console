import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupUserListParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/list';
import type { WorkspaceGroupUser } from '@/api-clients/identity/workspace-group-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceGroupUserListQueryReturn {
    data: Ref<WorkspaceGroupUser[]>;
    totalCount: Ref<number>;
    isLoading: Ref<boolean>;
}

interface UseWorkspaceGroupUserListQueryOptions {
    params: ComputedRef<WorkspaceGroupUserListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useWorkspaceGroupUserListQuery = ({ params, enabled }: UseWorkspaceGroupUserListQueryOptions): UseWorkspaceGroupUserListQueryReturn => {
    const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();

    const { key: workspaceGroupListQueryKey, params: workspaceGroupListQueryParams } = useServiceQueryKey('identity', 'workspace-group-user', 'list', {
        params,
    });

    const { data: queryData, isLoading } = useScopedQuery({
        queryKey: workspaceGroupListQueryKey,
        queryFn: async () => workspaceGroupUserAPI.list(workspaceGroupListQueryParams.value),
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN']);

    return {
        data: computed<WorkspaceGroupUser[]>(() => (queryData.value?.results?.[0]?.users ?? [])),
        totalCount: computed<number>(() => queryData.value?.results?.[0]?.users?.length ?? 0),
        isLoading,
    };
};
