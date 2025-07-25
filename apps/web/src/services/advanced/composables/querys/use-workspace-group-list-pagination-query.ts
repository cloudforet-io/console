import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupListParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/list';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseWorkspaceGroupListPaginationQueryOptions {
    params: ComputedRef<WorkspaceGroupListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useWorkspaceGroupListPaginationQuery = ({ params, thisPage, pageSize }: UseWorkspaceGroupListPaginationQueryOptions) => {
    const { workspaceGroupAPI } = useWorkspaceGroupApi();

    const { key: workspaceGroupListQueryKey, params: workspaceGroupListQueryParams } = useServiceQueryKey('identity', 'workspace-group', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: workspaceGroupListQueryKey,
        queryFn: workspaceGroupAPI.list,
        params: workspaceGroupListQueryParams,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
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
        data: computed<WorkspaceGroupModel[]>(() => data.value?.results ?? []),
        isLoading,
        totalCount,
        refresh,
    };
};
