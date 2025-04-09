import { computed, type Ref } from 'vue';

import dayjs from 'dayjs';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import { useMetricDataApi } from '@/api-clients/inventory/metric-data/composables/use-metric-data-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export type ResourceLabel = 'server' | 'database' | 'storage';

interface ProviderResourceMetricsResult {
    Provider: string;
    _total_count: number;
    [key: string]: any;
}

interface ProviderResourceMetrics {
    server: {
      data: Ref<ProviderResourceMetricsResult[]|undefined>;
      isLoading: Ref<boolean>;
    };
    database: {
      data: Ref<ProviderResourceMetricsResult[]|undefined>;
      isLoading: Ref<boolean>;
    },
    storage: {
      data: Ref<ProviderResourceMetricsResult[]|undefined>;
      isLoading: Ref<boolean>;
    }
}

const useMetricDataAnalyzeQuery = (metricId: string, opts?: {
    enabled?: Ref<boolean>;
}) => {
    const { enabled } = opts ?? {};
    const { metricDataAPI } = useMetricDataApi();
    const today = dayjs.utc().format('YYYY-MM-DD');

    const { key, params } = useServiceQueryKey('inventory', 'metric-data', 'analyze', {
        params: {
            metric_id: metricId,
            query: {
                granularity: 'DAILY',
                group_by: ['labels.Provider'],
                start: today,
                end: today,
                fields: {
                    count: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_count', desc: true }],
                field_group: ['date'],
            },
        },
        contextKey: metricId,
    });

    const { data, isLoading } = useScopedQuery({
        queryKey: key,
        queryFn: () => metricDataAPI.analyze(params.value),
        select: (response): ProviderResourceMetricsResult[] => response.results ?? [],
        enabled,
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 60, // 1 hour
    }, ['WORKSPACE']);

    return {
        metricData: data,
        isLoading,
    };
};

export const useMetricDataQuery = (ops?: {
    enabled?: Ref<boolean>;
}) => {
    const { enabled } = ops ?? {};
    const resourceTypes: { key: ResourceLabel; type: 'count'|'size' }[] = [
        { key: 'server', type: 'count' },
        { key: 'database', type: 'count' },
        { key: 'storage', type: 'size' },
    ];

    const resourceQueries = resourceTypes.map(({ key, type }) => {
        const metricId = `metric-managed-${key}-${type}`;
        return {
            key,
            ...useMetricDataAnalyzeQuery(metricId, { enabled }),
        };
    });

    const data = {} as ProviderResourceMetrics;

    resourceQueries.forEach((query) => {
        data[query.key] = {
            data: query.metricData,
            isLoading: query.isLoading,
        };
    });

    return {
        metricData: data,
        loadingMetricData: computed(() => resourceQueries.some((q) => q.isLoading.value)),
    };
};
