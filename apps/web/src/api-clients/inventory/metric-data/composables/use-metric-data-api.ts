import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';
import type { MetricDataAnalyzeParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/analyze';
import type { MetricDataListParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/list';
import type { MetricDataStatParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/stat';
import type { MetricDataModel } from '@/api-clients/inventory/metric-data/schema/model';



export const useMetricDataApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.metricData.list<MetricDataListParameters, ListResponse<MetricDataModel>>,
        analyze: SpaceConnector.clientV2.inventory.metricData.analyze<MetricDataAnalyzeParameters, AnalyzeResponse<any>>,
        stat: SpaceConnector.clientV2.inventory.metricData.stat<MetricDataStatParameters, StatResponse>,
    };

    return {
        metricDataAPI: actions,
    };
};
