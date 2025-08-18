import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MetricCreateParameters } from '@/api-clients/inventory/metric/schema/api-verbs/create';
import type { MetricDeleteParameters } from '@/api-clients/inventory/metric/schema/api-verbs/delete';
import type { MetricGetParameters } from '@/api-clients/inventory/metric/schema/api-verbs/get';
import type { MetricListParameters } from '@/api-clients/inventory/metric/schema/api-verbs/list';
import type { MetricRunParameters } from '@/api-clients/inventory/metric/schema/api-verbs/run';
import type { MetricUpdateParameters } from '@/api-clients/inventory/metric/schema/api-verbs/update';
import type { MetricModel } from '@/api-clients/inventory/metric/schema/model';
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

export const useMetricApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('metric');

    const actions = {
        create: wrapResourceCacheRefresh(SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>),
        delete: wrapResourceCacheRefresh(SpaceConnector.clientV2.inventory.metric.delete<MetricDeleteParameters>),
        get: SpaceConnector.clientV2.inventory.metric.get<MetricGetParameters, MetricModel>,
        run: wrapResourceCacheRefresh(SpaceConnector.clientV2.inventory.metric.run<MetricRunParameters>),
        update: wrapResourceCacheRefresh(SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>),
        list: SpaceConnector.clientV2.inventory.metric.list<MetricListParameters, ListResponse<MetricModel>>,
    };

    return {
        metricAPI: actions,
    };
};
