import { computed, type ComputedRef } from 'vue';

import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import type { MetricListParameters } from '@/api-clients/inventory/metric/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseMetricListQueryOptions {
    params: ComputedRef<MetricListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useMetricListQuery = ({
    params,
    enabled,
}: UseMetricListQueryOptions) => {
    const { metricAPI } = useMetricApi();
    const { key, params: metricParams } = useServiceQueryKey('inventory', 'metric', 'list', {
        params: computed(() => params.value),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: async () => metricAPI.list(metricParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
        enabled: computed(() => !!enabled?.value),
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        metricListQueryKey: key,
    };
};
