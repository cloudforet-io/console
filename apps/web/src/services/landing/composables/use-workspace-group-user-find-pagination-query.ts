import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupUserFindParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/find';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface UseWorkspaceGroupUserFindQueryOptions {
    params: ComputedRef<WorkspaceGroupUserFindParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useWorkspaceGroupUserFindPaginationQuery = ({ params, thisPage, pageSize }: UseWorkspaceGroupUserFindQueryOptions) => {
    const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();


    const { key, params: queryParams } = useServiceQueryKey('identity', 'workspace-group-user', 'find', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: workspaceGroupUserAPI.find,
        params: queryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'find',
    }, ['USER']);


    const refresh = async () => {
        query.refetch();
    };

    return {
        data,
        totalCount,
        isLoading,
        refresh,
    };
};
