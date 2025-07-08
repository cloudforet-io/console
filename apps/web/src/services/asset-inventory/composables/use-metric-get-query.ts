import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import type { MetricGetParameters } from '@/api-clients/inventory/metric/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseMetricGetQueryOptions {
    metricId: ComputedRef<string>;
}

export const useMetricGetQuery = ({ metricId }: UseMetricGetQueryOptions) => {
    const { metricAPI } = useMetricApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'metric', 'get', {
        params: computed<MetricGetParameters>(() => ({ metric_id: metricId.value })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => metricAPI.get(queryParams.value),
        enabled: computed(() => !!metricId.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        metricGetQueryKey: key,
    };
};
