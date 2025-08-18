import { computed, type ComputedRef } from 'vue';

import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import type { UserProfileGetWorkspacesParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/get-workspaces';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useUserProfileGetWorkspacesQuery = (params?: ComputedRef<UserProfileGetWorkspacesParameters|undefined>) => {
    const { userProfileAPI } = useUserProfileApi();

    const { key: userProfileGetWorkspacesQueryKey, params: queryParams } = useServiceQueryKey('identity', 'user-profile', 'get-workspaces', {
        params,
    });

    const { data, isLoading } = useScopedQuery({
        queryKey: userProfileGetWorkspacesQueryKey,
        queryFn: () => userProfileAPI.getWorkspaces(queryParams.value),
        select: (d) => d.results?.filter((workspace) => workspace.state === 'ENABLED') || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minute
        enabled: true,
    }, ['USER']);

    return {
        data,
        isLoading,
        totalCount: computed(() => data.value?.length ?? 0),
        key: userProfileGetWorkspacesQueryKey,
    };
};
