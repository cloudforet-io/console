import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useUserProfileGetWorkspaceGroupsQuery = () => {
    const { userProfileAPI } = useUserProfileApi();

    const { key: userProfileGetWorkspaceGroupsQueryKey } = useServiceQueryKey('identity', 'user-profile', 'get-workspace-groups');

    const { data, isLoading, refetch } = useScopedQuery({
        queryKey: userProfileGetWorkspaceGroupsQueryKey,
        queryFn: () => userProfileAPI.getWorkspaceGroups(),
        select: (d) => d.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minute
        enabled: true,
    }, ['USER']);

    return {
        data,
        isLoading,
        key: userProfileGetWorkspaceGroupsQueryKey,
        refetch,
    };
};
