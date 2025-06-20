import { computed } from 'vue';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useWorkspaceHomeCollectorListQuery = () => {
    const { collectorAPI } = useCollectorApi();
    const { key: collectorListKey, params } = useServiceQueryKey('inventory', 'collector', 'list', {
        params: computed(() => ({
            query: {
                only: ['collector_id'],
            },
        })),
    });
    return useScopedQuery({
        queryKey: collectorListKey,
        queryFn: () => collectorAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5, // 5 minutes
    }, ['WORKSPACE']);
};
