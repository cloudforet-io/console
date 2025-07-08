import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMetricExampleApi } from '@/api-clients/inventory/metric-example/composables/use-metric-example-api';
import type { MetricExampleGetParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseMetricExampleGetQueryOptions {
    metricExampleId: ComputedRef<string>;
}

export const useMetricExampleGetQuery = ({ metricExampleId }: UseMetricExampleGetQueryOptions) => {
    const { metricExampleAPI } = useMetricExampleApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'metric-example', 'get', {
        params: computed<MetricExampleGetParameters>(() => ({ example_id: metricExampleId.value })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => metricExampleAPI.get(queryParams.value),
        enabled: computed(() => !!metricExampleId.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: query.data,
        isLoading: query.isLoading,
        metricExampleGetQueryKey: key,
    };
};
