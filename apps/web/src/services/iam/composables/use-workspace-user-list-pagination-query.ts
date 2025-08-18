import { computed, type ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseWorkspaceUserListPaginationQueryOptions {
    params: ComputedRef<WorkspaceUserListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    selectedUserGroup: ComputedRef<UserGroupModel>;
}

export const useWorkspaceUserListPaginationQuery = ({
    params, thisPage, pageSize, selectedUserGroup,
}: UseWorkspaceUserListPaginationQueryOptions) => {
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const queryClient = useQueryClient();

    const { key: workspaceUserListPaginationQueryKey, params: workspaceUserListPaginationQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const { data, totalCount, isLoading } = useScopedPaginationQuery({
        queryKey: workspaceUserListPaginationQueryKey,
        queryFn: workspaceUserAPI.list,
        params: workspaceUserListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => !!(selectedUserGroup.value?.users && selectedUserGroup.value?.users.length > 0)),
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['WORKSPACE']);

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: workspaceUserListPaginationQueryKey.value });
    };

    return {
        data: computed<WorkspaceUserModel[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
