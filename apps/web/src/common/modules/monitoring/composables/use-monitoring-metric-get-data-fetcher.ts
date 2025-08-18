
import { useQueryClient } from '@tanstack/vue-query';

import { useMonitoringMetricApi } from '@/api-clients/monitoring/metric/composables/use-monitoring-metric-api';
import type { MonitoringMetricGetDataParameters } from '@/api-clients/monitoring/metric/schema/api-verbs/get-data';
import type { MonitoringMetricGetDataModel } from '@/api-clients/monitoring/metric/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';


export const useMonitoringMetricGetDataFetcher = () => {
    const { monitoringMetricAPI } = useMonitoringMetricApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('monitoring', 'metric', 'getData');

    const getMetricData = async (params: MonitoringMetricGetDataParameters) => {
        const key = withSuffix([params.metric, params]);
        const response = queryClient.ensureQueryData<MonitoringMetricGetDataModel>({
            queryKey: key,
            queryFn: () => monitoringMetricAPI.getData(params),
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 3,
        });

        return response;
    };

    return {
        getMetricData,
    };
};
