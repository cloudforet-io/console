import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MonitoringMetricGetDataParameters } from '@/api-clients/monitoring/metric/schema/api-verbs/get-data';
import type { MonitoringMetricListParameters } from '@/api-clients/monitoring/metric/schema/api-verbs/list';
import type { MonitoringMetricListModel, MonitoringMetricGetDataModel } from '@/api-clients/monitoring/metric/schema/model';

export const useMonitoringMetricApi = () => {
    const actions = {
        list: SpaceConnector.client.monitoring.metric.list<MonitoringMetricListParameters, MonitoringMetricListModel>,
        getData: SpaceConnector.client.monitoring.metric.getData<MonitoringMetricGetDataParameters, MonitoringMetricGetDataModel>,
    };

    return {
        monitoringMetricAPI: actions,
    };
};
