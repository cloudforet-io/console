import { computed, type ComputedRef } from 'vue';

import { useCollectorRuleApi } from '@/api-clients/inventory/collector-rule/composables/use-collector-rule-api';
import type { CollectorRuleListParameters } from '@/api-clients/inventory/collector-rule/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface UseCollectorRuleListQueryOptions {
    collectorId?: ComputedRef<string|undefined>;
}

export const useCollectorRuleListQuery = ({
    collectorId,
}: UseCollectorRuleListQueryOptions) => {
    const { collectorRuleAPI } = useCollectorRuleApi();
    const { key, params: collectorRuleParams } = useServiceQueryKey('inventory', 'collector-rule', 'list', {
        contextKey: collectorId,
        params: computed<CollectorRuleListParameters>(() => ({
            collector_id: collectorId?.value as string,
        })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: async () => collectorRuleAPI.list(collectorRuleParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!collectorId?.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        collectorRuleListQueryKey: key,
    };
};
