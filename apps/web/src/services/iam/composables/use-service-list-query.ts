import { computed } from 'vue';

import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useServiceListQuery = () => {
    const { serviceAPI } = useServiceApi();
    const { key, params } = useServiceQueryKey('alert-manager', 'service', 'list', {
        params: computed(() => ({
            query: {
                only: ['service_id', 'service_key', 'members', 'name'],
            },
        })),
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => serviceAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
