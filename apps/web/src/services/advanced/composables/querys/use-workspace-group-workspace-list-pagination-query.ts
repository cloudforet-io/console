import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseWorkspaceGroupWorkspaceListPaginationQueryOptions {
    params: ComputedRef<WorkspaceListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    enabled?: ComputedRef<boolean>;
}

export const useWorkspaceGroupWorkspaceListPaginationQuery = ({
    params, thisPage, pageSize, enabled,
}: UseWorkspaceGroupWorkspaceListPaginationQueryOptions) => {
    // NOTE: This query is not available if workspace_group_id is not set
    if (!params.value.query?.filter?.find((filter) => filter.k === 'workspace_group_id')) {
        ErrorHandler.handleError(new Error('workspace_group_id is required'));
        return {
            data: computed<WorkspaceModel[]>(() => []),
            totalCount: computed(() => 0),
            isLoading: computed(() => false),
            refresh: async () => {},
        };
    }

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
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
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
