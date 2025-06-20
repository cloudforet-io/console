import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MetricCreateParameters } from '@/api-clients/inventory/metric/schema/api-verbs/create';
import type { MetricDeleteParameters } from '@/api-clients/inventory/metric/schema/api-verbs/delete';
import type { MetricGetParameters } from '@/api-clients/inventory/metric/schema/api-verbs/get';
import type { MetricListParameters } from '@/api-clients/inventory/metric/schema/api-verbs/list';
import type { MetricRunParameters } from '@/api-clients/inventory/metric/schema/api-verbs/run';
import type { MetricUpdateParameters } from '@/api-clients/inventory/metric/schema/api-verbs/update';
import type { MetricModel } from '@/api-clients/inventory/metric/schema/model';

export const useMetricApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>,
        delete: SpaceConnector.clientV2.inventory.metric.delete<MetricDeleteParameters>,
        get: SpaceConnector.clientV2.inventory.metric.get<MetricGetParameters, MetricModel>,
        run: SpaceConnector.clientV2.inventory.metric.run<MetricRunParameters>,
        update: SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>,
        list: SpaceConnector.clientV2.inventory.metric.list<MetricListParameters, ListResponse<MetricModel>>,
    };

    return {
        metricAPI: actions,
    };
};
