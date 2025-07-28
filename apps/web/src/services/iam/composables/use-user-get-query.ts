import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseUserGetQueryOptions {
    userId: ComputedRef<string>;
}

export const useUserGetQuery = ({ userId }: UseUserGetQueryOptions) => {
    const { userAPI } = useUserApi();
    const { key, params } = useServiceQueryKey('identity', 'user', 'get', {
        params: computed(() => ({
            user_id: userId.value,
        })),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => userAPI.get(params.value),
        enabled: computed(() => !!userId.value),
        // staleTime: 1000 * 60 * 5,
        // gcTime: 1000 * 60 * 10,
    }, ['DOMAIN']);
};
