import { computed, type ComputedRef } from 'vue';

import { useMetricExampleApi } from '@/api-clients/inventory/metric-example/composables/use-metric-example-api';
import type { MetricExampleListParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseMetricExampleListQueryOptions {
    params?: ComputedRef<MetricExampleListParameters>;
}

export const useMetricExampleListQuery = ({
    params,
}: UseMetricExampleListQueryOptions = {}) => {
    const { metricExampleAPI } = useMetricExampleApi();
    const { key, params: metricExampleParams } = useServiceQueryKey('inventory', 'metric-example', 'list', {
        params: computed(() => params?.value ?? {}),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: async () => metricExampleAPI.list(metricExampleParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
