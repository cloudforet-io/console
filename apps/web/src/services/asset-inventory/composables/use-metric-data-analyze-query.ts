import { computed, type ComputedRef } from 'vue';

import { useMetricDataApi } from '@/api-clients/inventory/metric-data/composables/use-metric-data-api';
import type { MetricDataAnalyzeParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/analyze';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseMetricDataAnalyzePaginationQueryOptions {
    params: ComputedRef<MetricDataAnalyzeParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

interface UseMetricDataAnalyzeQueryOptions {
    params: ComputedRef<MetricDataAnalyzeParameters>;
    enabled: ComputedRef<boolean>;
}

export const useMetricDataAnalyzePaginationQuery = ({
    params,
    thisPage,
    pageSize,
}: UseMetricDataAnalyzePaginationQueryOptions) => {
    const { metricDataAPI } = useMetricDataApi();
    const { key, params: metricParams } = useServiceQueryKey('inventory', 'metric-data', 'analyze', {
        params,
        pagination: true,
    });

    return useScopedPaginationQuery({
        queryKey: key,
        queryFn: metricDataAPI.analyze,
        params: metricParams,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, {
        thisPage,
        pageSize,
        verb: 'analyze',
    }, ['DOMAIN', 'WORKSPACE']);
};

export const useMetricDataAnalyzeQuery = ({
    params,
    enabled,
}: UseMetricDataAnalyzeQueryOptions) => {
    const { metricDataAPI } = useMetricDataApi();
    const { key, params: metricParams } = useServiceQueryKey('inventory', 'metric-data', 'analyze', {
        params,
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => metricDataAPI.analyze(metricParams.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
        enabled: computed(() => {
            if (enabled.value === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
