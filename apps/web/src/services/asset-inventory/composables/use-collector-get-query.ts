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
    return {
        ...useScopedQuery({
            queryKey: key,
            queryFn: () => {
                if (!collectorParams.value.collector_id) {
                    throw new Error('Collector ID is required for fetching collector');
                }
                return collectorAPI.get(collectorParams.value);
            },
            enabled: computed(() => !!collectorId?.value),
            staleTime: 1000 * 60 * 2, // 2 minutes
            gcTime: 1000 * 60 * 2, // 2 minutes
        }, ['DOMAIN', 'WORKSPACE']),
        collectorGetQueryKey: key,
    };
};
