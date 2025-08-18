import {
    computed, type ComputedRef,
} from 'vue';

import { useMonitoringMetricApi } from '@/api-clients/monitoring/metric/composables/use-monitoring-metric-api';
import type { MonitoringMetricListParameters } from '@/api-clients/monitoring/metric/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface MonitoringMetricListQueryOptions {
    params: ComputedRef<MonitoringMetricListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useMonitoringMetricListQuery = ({ params, enabled }: MonitoringMetricListQueryOptions) => {
    const { monitoringMetricAPI } = useMonitoringMetricApi();
    const { key, params: metricListParams } = useServiceQueryKey('monitoring', 'metric', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => monitoringMetricAPI.list(metricListParams.value),
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['DOMAIN', 'WORKSPACE']);
};
