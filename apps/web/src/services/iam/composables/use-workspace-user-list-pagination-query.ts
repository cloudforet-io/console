import { computed, type ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface UseWorkspaceUserListPaginationQueryOptions {
    params: ComputedRef<WorkspaceUserListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useWorkspaceUserListPaginationQuery = ({ params, thisPage, pageSize }: UseWorkspaceUserListPaginationQueryOptions) => {
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const queryClient = useQueryClient();

    const appContextStore = useAppContextStore();
    const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

    const { key: workspaceUserListPaginationQueryKey, params: workspaceUserListPaginationQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const query = useScopedPaginationQuery({
        queryKey: workspaceUserListPaginationQueryKey,
        queryFn: workspaceUserAPI.list,
        params: workspaceUserListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        enabled: computed(() => !isAdminMode.value),
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['WORKSPACE']);

    const refresh = async () => {
        await queryClient.resetQueries({ queryKey: workspaceUserListPaginationQueryKey.value });
    };

    console.log({
        data: computed<WorkspaceUserModel[]>(() => query.data.value?.results || []),
        totalCount: query.totalCount,
        isLoading: query.isLoading,
        refresh,
    });

    return {
        data: computed<WorkspaceUserModel[]>(() => query.data.value?.results || []),
        totalCount: query.totalCount,
        isLoading: query.isLoading,
        refresh,
    };
};
