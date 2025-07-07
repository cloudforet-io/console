import { computed, type ComputedRef } from 'vue';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorGetParameters } from '@/api-clients/inventory/collector/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseCollectorGetQueryOptions {
    collectorId?: ComputedRef<string|undefined>;
}

export const useCollectorGetQuery = ({
    collectorId,
}: UseCollectorGetQueryOptions) => {
    const { collectorAPI } = useCollectorApi();
    const { key, params: collectorParams } = useServiceQueryKey('inventory', 'collector', 'get', {
        contextKey: collectorId,
        params: computed<CollectorGetParameters>(() => ({
            collector_id: collectorId?.value as string,
        })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => collectorAPI.get(collectorParams.value),
        enabled: computed(() => !!collectorId?.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        collectorGetQueryKey: key,
    };
};
