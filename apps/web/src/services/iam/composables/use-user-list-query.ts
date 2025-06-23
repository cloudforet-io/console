
import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useUserGroupUserListQuery = () => {
    const { userAPI } = useUserApi();
    const { key: userListKey } = useServiceQueryKey('identity', 'user', 'list');
    return useScopedQuery({
        queryKey: userListKey,
        queryFn: () => userAPI.list({}),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['DOMAIN']);
};
