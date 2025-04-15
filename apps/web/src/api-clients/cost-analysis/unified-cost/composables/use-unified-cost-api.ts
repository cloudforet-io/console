import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UnifiedCostAnalyzeParameters } from '@/api-clients/cost-analysis/unified-cost/schema/api-verbs/analyze';
import type { UnifiedCostListParameters } from '@/api-clients/cost-analysis/unified-cost/schema/api-verbs/list';
import type { UnifiedCostStatParameters } from '@/api-clients/cost-analysis/unified-cost/schema/api-verbs/stat';
import type { UnifiedCostModel } from '@/api-clients/cost-analysis/unified-cost/schema/model';

export const useUnifiedCostApi = () => {
    const actions = {
        analyze: SpaceConnector.clientV2.costAnalysis.unifiedCost.analyze<UnifiedCostAnalyzeParameters, AnalyzeResponse<any>>,
        list: SpaceConnector.clientV2.costAnalysis.unifiedCost.list<UnifiedCostListParameters, ListResponse<UnifiedCostModel>>,
        stat: SpaceConnector.clientV2.costAnalysis.unifiedCost.stat<UnifiedCostStatParameters, any>,
    };

    return {
        unifiedCostAPI: actions,
    };
};
