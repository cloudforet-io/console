import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MetricExampleCreateParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/create';
import type { MetricExampleDeleteParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/delete';
import type { MetricExampleGetParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/get';
import type { MetricExampleListParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/list';
import type { MetricExampleUpdateParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/update';
import type { MetricExampleModel } from '@/api-clients/inventory/metric-example/schema/model';


export const useMetricExampleApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.metricExample.list<MetricExampleListParameters, ListResponse<MetricExampleModel>>,
        get: SpaceConnector.clientV2.inventory.metricExample.get<MetricExampleGetParameters, MetricExampleModel>,
        create: SpaceConnector.clientV2.inventory.metricExample.create<MetricExampleCreateParameters, MetricExampleModel>,
        update: SpaceConnector.clientV2.inventory.metricExample.update<MetricExampleUpdateParameters, MetricExampleModel>,
        delete: SpaceConnector.clientV2.inventory.metricExample.delete<MetricExampleDeleteParameters>,
    };

    return {
        metricExampleAPI: actions,
    };
};
