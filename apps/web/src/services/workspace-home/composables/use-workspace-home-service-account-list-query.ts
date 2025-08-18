import { computed } from 'vue';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceHomeServiceAccountListQuery = () => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const { key: serviceAccountListKey, params } = useServiceQueryKey('identity', 'service-account', 'list', {
        params: computed(() => ({
            query: {
                only: ['service_account_id'],
            },
        })),
    });
    return useScopedQuery({
        queryKey: serviceAccountListKey,
        queryFn: () => serviceAccountAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['WORKSPACE']);
};
