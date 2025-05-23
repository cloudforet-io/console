import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { BudgetUsageListParameters } from '@/api-clients/cost-analysis/budget-usage/schema/api-verbs/list';
import type { BudgetUsageModel } from '@/api-clients/cost-analysis/budget-usage/schema/model';


export const useBudgetUsageApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.costAnalysis.budgetUsage.list<BudgetUsageListParameters, ListResponse<BudgetUsageModel>>,
        analyze: SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze,
    };

    return {
        budgetUsageAPI: actions,
    };
};
