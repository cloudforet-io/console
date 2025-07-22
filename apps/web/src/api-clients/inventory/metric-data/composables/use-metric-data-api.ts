import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';
import type { MetricDataAnalyzeParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/analyze';
import type { MetricDataStatParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/stat';



export const useMetricDataApi = () => {
    const actions = {
        analyze: SpaceConnector.clientV2.inventory.metricData.analyze<MetricDataAnalyzeParameters, AnalyzeResponse<any>>,
        stat: SpaceConnector.clientV2.inventory.metricData.stat<MetricDataStatParameters, StatResponse>,
    };

    return {
        metricDataAPI: actions,
    };
};
