import type { ComputedRef } from 'vue';
import { computed } from 'vue';


import { useMonitoringDataSourceApi } from '@/api-clients/monitoring/data-source/composables/use-monitoring-data-source-api';
import type { DataSourceGetParameters } from '@/api-clients/monitoring/data-source/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface MonitoringDataSourceGetQueryOptions {
    dataSourceId: ComputedRef<string>;
}

export const useMonitoringDataSourceGetQuery = ({ dataSourceId }: MonitoringDataSourceGetQueryOptions) => {
    const { dataSourceAPI } = useMonitoringDataSourceApi();
    const { key, params } = useServiceQueryKey('monitoring', 'data-source', 'get', {
        contextKey: computed(() => dataSourceId.value),
        params: computed<DataSourceGetParameters>(() => ({
            data_source_id: dataSourceId.value,
        })),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => {
            if (!params.value.data_source_id) {
                if (import.meta.env.DEV) {
                    throw new Error('[useMonitoringDataSourceGetQuery.ts] dataSourceId is required');
                } else throw new Error('dataSourceId is required');
            }
            return dataSourceAPI.get(params.value);
        },
        enabled: computed(() => !!dataSourceId.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['DOMAIN', 'WORKSPACE']);
};
