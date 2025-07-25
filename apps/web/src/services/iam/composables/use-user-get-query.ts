import type { Ref } from 'vue';
import { computed } from 'vue';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserPageStore } from '@/services/iam/store/user-page-store';

export const useUserGetQuery = (userId: Ref<string>) => {
    const { userAPI } = useUserApi();
    const { workspaceUserAPI } = useWorkspaceUserApi();

    const userPageStore = useUserPageStore();
    const isAdminMode = computed<boolean>(() => userPageStore.state.isAdminMode);

    const { key: userQueryKey, params: userQueryParams } = useServiceQueryKey('identity', 'user', 'get', {
        contextKey: userId.value,
        params: computed(() => ({
            user_id: userId.value,
        })),
    });

    const { key: workspaceUserQueryKey, params: workspaceUserQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'get', {
        contextKey: userId.value,
        params: computed(() => ({
            user_id: userId.value,
        })),
    });

    const { data: userData } = useScopedQuery({
        queryKey: userQueryKey,
        queryFn: () => userAPI.get(userQueryParams.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
        enabled: computed(() => isAdminMode.value),
    }, ['DOMAIN']);

    const { data: workspaceUserData } = useScopedQuery({
        queryKey: workspaceUserQueryKey,
        queryFn: () => workspaceUserAPI.get(workspaceUserQueryParams.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
        enabled: computed(() => !isAdminMode.value),
    }, ['WORKSPACE']);

    return {
        userData,
        workspaceUserData,
    };
};
