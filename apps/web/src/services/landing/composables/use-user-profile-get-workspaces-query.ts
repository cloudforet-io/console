import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useUserProfileGetWorkspacesQuery = () => {
    const { userProfileAPI } = useUserProfileApi();

    const { key: userProfileGetWorkspacesQueryKey } = useServiceQueryKey('identity', 'user-profile', 'get-workspaces');

    const { data, isLoading } = useScopedQuery({
        queryKey: userProfileGetWorkspacesQueryKey,
        queryFn: () => userProfileAPI.getWorkspaces(),
        select: (d) => d.results?.filter((workspace) => workspace.state === 'ENABLED') || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        enabled: true,
    }, ['USER']);

    return {
        data,
        isLoading,
        key: userProfileGetWorkspacesQueryKey,
    };
};
