import {
    computed, type ComputedRef,
} from 'vue';

import { useMonitoringDataSourceApi } from '@/api-clients/monitoring/data-source/composables/use-monitoring-data-source-api';
import type { DataSourceListParameters } from '@/api-clients/monitoring/data-source/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface MonitoringDataSourceListQueryOptions {
    params: ComputedRef<DataSourceListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useMonitoringDataSourceListQuery = ({ params, enabled }: MonitoringDataSourceListQueryOptions) => {
    const { dataSourceAPI } = useMonitoringDataSourceApi();
    const { key, params: monitoringDataSourceListParams } = useServiceQueryKey('monitoring', 'data-source', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => dataSourceAPI.list(monitoringDataSourceListParams.value),
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['DOMAIN', 'WORKSPACE']);
};
