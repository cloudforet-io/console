import { computed } from 'vue';

import { useMetricExampleApi } from '@/api-clients/inventory/metric-example/composables/use-metric-example-api';
import type { MetricExampleModel } from '@/api-clients/inventory/metric-example/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useMetricExampleFavoriteMap = () => {
    const { metricExampleAPI } = useMetricExampleApi();

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'metric-example', 'list', {
        params: {
            query: {
                only: ['example_id', 'name', 'metric_id'],
            },
        },
    });
    const { data: metricExampleList, isFetching: isFetchingMetricExampleList } = useScopedQuery({
        queryKey: key,
        queryFn: () => metricExampleAPI.list(queryParams.value),
        select: (data) => data.results ?? [],
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['WORKSPACE']);

    return {
        map: computed<Map<string, MetricExampleModel>>(() => {
            const metricExampleMap = new Map<string, MetricExampleModel>();
            metricExampleList.value?.forEach((item) => {
                metricExampleMap.set(item.example_id, item);
            });
            return metricExampleMap;
        }),
        loading: isFetchingMetricExampleList,
    };
};
