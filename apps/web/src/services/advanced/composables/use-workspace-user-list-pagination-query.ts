import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseWorkspaceUserListPaginationQueryOptions {
    params: ComputedRef<WorkspaceUserListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useWorkspaceUserListPaginationQuery = ({ params, thisPage, pageSize }: UseWorkspaceUserListPaginationQueryOptions) => {
    const { workspaceUserAPI } = useWorkspaceUserApi();


    const { key: workspaceUserListPaginationQueryKey, params: workspaceUserListPaginationQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: workspaceUserListPaginationQueryKey,
        queryFn: workspaceUserAPI.list,
        params: workspaceUserListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN']);


    const refresh = async () => {
        query.refetch();
    };

    return {
        data: computed<WorkspaceUserModel[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
