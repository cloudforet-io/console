import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { AlertListParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/list';
import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseWorkspaceListPaginationQueryOptions {
    params: ComputedRef<AlertListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useWorkspaceListPaginationQuery = ({ params, thisPage, pageSize }: UseWorkspaceListPaginationQueryOptions) => {
    const { workspaceAPI } = useWorkspaceApi();


    const { key: workspaceListPaginationQueryKey, params: workspaceListPaginationQueryParams } = useServiceQueryKey('identity', 'workspace', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: workspaceListPaginationQueryKey,
        queryFn: workspaceAPI.list,
        params: workspaceListPaginationQueryParams,
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
        data: computed<WorkspaceModel[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
