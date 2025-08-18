import type { Ref } from 'vue';
import { computed } from 'vue';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserPageStore } from '@/services/iam/store/user-page-store';

export const useUserListQuery = (userIds?: Ref<string[]>) => {
    const { userAPI } = useUserApi();
    const { workspaceUserAPI } = useWorkspaceUserApi();

    const userPageStore = useUserPageStore();
    const isAdminMode = computed<boolean>(() => userPageStore.state.isAdminMode);

    const { key: userListKey, params: userListParams } = useServiceQueryKey('identity', 'user', 'list', {
        params: computed(() => ({
            query: {
                filter: [
                    { k: 'user_id', v: userIds?.value, o: 'in' },
                ],
            },
        })),
    });
    const { key: workspaceUserListKey, params: workspaceUserListParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
        params: computed(() => ({
            query: {
                filter: [
                    { k: 'user_id', v: userIds?.value, o: 'in' },
                ],
            },
        })),
    });

    const { data: userListData } = useScopedQuery({
        queryKey: userListKey,
        queryFn: () => userAPI.list(userListParams.value as UserListParameters),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => isAdminMode.value && userIds && userIds.value.length > 0),
    }, ['DOMAIN']);

    const { data: workspaceUserListData } = useScopedQuery({
        queryKey: workspaceUserListKey,
        queryFn: () => workspaceUserAPI.list(workspaceUserListParams.value as WorkspaceUserListParameters),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => !isAdminMode.value && userIds && userIds.value.length > 0),
    }, ['WORKSPACE']);

    return {
        userListKey,
        userListData,
        workspaceUserListData,
    };
};
