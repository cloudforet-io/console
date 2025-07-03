import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface UseUserListPaginationQueryOptions {
    params: ComputedRef<UserListParameters | WorkspaceUserListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useUserListPaginationQuery = ({ params, thisPage, pageSize }: UseUserListPaginationQueryOptions) => {
    const { userAPI } = useUserApi();
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const queryClient = useQueryClient();

    const appContextStore = useAppContextStore();
    const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

    const { key: userListPaginationQueryKey, params: userListPaginationQueryParams } = useServiceQueryKey('identity', 'user', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const { key: workspaceUserListPaginationQueryKey, params: workspaceUserListPaginationQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });


    const queryFn = async (_params: UserListParameters | WorkspaceUserListParameters) => {
        if (isAdminMode.value) {
            return userAPI.list(_params as UserListParameters);
        }
        return workspaceUserAPI.list(_params as WorkspaceUserListParameters);
    };

    const {
        data,
        totalCount,
        isLoading,
    } = useScopedPaginationQuery({
        queryKey: isAdminMode.value ? userListPaginationQueryKey : workspaceUserListPaginationQueryKey,
        queryFn,
        params: isAdminMode.value ? userListPaginationQueryParams : workspaceUserListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, isAdminMode.value ? ['DOMAIN'] : ['WORKSPACE']);

    const refresh = async () => {
        await queryClient.resetQueries({ queryKey: isAdminMode.value ? userListPaginationQueryKey : workspaceUserListPaginationQueryKey.value });
    };

    return {
        data: computed<Partial<UserModel>[] | Partial<WorkspaceUserModel>[]>(() => data.value?.results || []),
        totalCount,
        isLoading,
        refresh,
    };
};
