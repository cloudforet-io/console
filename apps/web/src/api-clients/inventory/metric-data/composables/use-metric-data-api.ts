import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MetricDataAnalyzeParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/analyze';
import type { MetricDataListParameters } from '@/schema/inventory/metric-data/api-verbs/list';
import type { MetricDataModel } from '@/schema/inventory/metric-data/model';




export const useMetricDataApi = () => {
    const actions = {
        async list(params: MetricDataListParameters) {
            return SpaceConnector.clientV2.inventory.metricData.list<MetricDataListParameters, ListResponse<MetricDataModel>>(params);
        },
        async analyze<T = any>(params: MetricDataAnalyzeParameters) {
            return SpaceConnector.clientV2.inventory.metricData.analyze<MetricDataAnalyzeParameters, AnalyzeResponse<T>>(params);
        },
    };

    return {
        metricDataAPI: actions,
    };
};
