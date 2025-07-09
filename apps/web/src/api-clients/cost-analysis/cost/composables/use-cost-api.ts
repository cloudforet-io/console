import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { CostAnalyzeParameters } from '@/api-clients/cost-analysis/cost/schema/api-verbs/analyze';
import type { CostStatParameters } from '@/api-clients/cost-analysis/cost/schema/api-verbs/stat';

import type { ListResponse } from '@/lib/variable-models/_base/types';

import type { CostAnalyzeRawData } from '@/services/cost-explorer/types/cost-analyze-type';

import type { CostModel } from '../schema/model';

interface UseCostApiReturn {
    costAPI: {
        analyze: (params: CostAnalyzeParameters) => Promise<AnalyzeResponse<CostAnalyzeRawData>>;
        stat: (params: CostStatParameters) => Promise<ListResponse<CostModel>>;
    }
}
export const useCostApi = (): UseCostApiReturn => {
    const actions = {
        analyze: SpaceConnector.clientV2.costAnalysis.cost.analyze<CostAnalyzeParameters, AnalyzeResponse<CostAnalyzeRawData>>,
        stat: SpaceConnector.clientV2.costAnalysis.cost.stat<CostStatParameters, ListResponse<CostModel>>,
    };

    return {
        costAPI: actions,
    };
};
