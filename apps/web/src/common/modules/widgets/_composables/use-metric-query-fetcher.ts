
import { useQueryClient } from '@tanstack/vue-query';

import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

export const useMetricQueryFetcher = () => {
    const { metricAPI } = useMetricApi();
    const queryClient = useQueryClient();
    const { withSuffix: metricQueryKey } = useServiceQueryKey('inventory', 'metric', 'get');

    const getMetric = async (metricId: string) => queryClient.fetchQuery({
        queryKey: metricQueryKey([metricId, { metric_id: metricId }]),
        queryFn: () => metricAPI.get({ metric_id: metricId }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 3,
    });

    return {
        getMetric,
    };
};
