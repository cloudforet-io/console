import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import type { QueryObserverResult } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupUserListParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/list';
import type { WorkspaceGroupUser, WorkspaceGroupUserModel } from '@/api-clients/identity/workspace-group-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseWorkspaceGroupUserListQueryReturn {
    data: Ref<WorkspaceGroupUser[]>;
    totalCount: Ref<number>;
    isLoading: Ref<boolean>;
    refetch: () => Promise<QueryObserverResult<ListResponse<WorkspaceGroupUserModel>, unknown>>;
}

interface UseWorkspaceGroupUserListQueryOptions {
    params: ComputedRef<WorkspaceGroupUserListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useWorkspaceGroupUserListQuery = ({ params, enabled }: UseWorkspaceGroupUserListQueryOptions): UseWorkspaceGroupUserListQueryReturn => {
    const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();

    const { key: workspaceGroupListUserQueryKey, params: workspaceGroupListUserQueryParams } = useServiceQueryKey('identity', 'workspace-group-user', 'list', {
        params,
    });

    const { data: queryData, isLoading, refetch } = useScopedQuery({
        queryKey: workspaceGroupListUserQueryKey,
        queryFn: async () => workspaceGroupUserAPI.list(workspaceGroupListUserQueryParams.value),
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
        refetch,
    };
};
