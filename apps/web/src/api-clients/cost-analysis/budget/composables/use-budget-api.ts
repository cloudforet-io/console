import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { BudgetCreateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/create';
import type { BudgetDeleteParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/delete';
import type { BudgetGetParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/get';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetSetNotificationParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/set-notification';
import type { BudgetUpdateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/update';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';


export const useBudgetApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.costAnalysis.budget.list<BudgetListParameters, ListResponse<BudgetModel>>,
        get: SpaceConnector.clientV2.costAnalysis.budget.get<BudgetGetParameters, BudgetModel>,
        create: SpaceConnector.clientV2.costAnalysis.budget.create<BudgetCreateParameters, BudgetModel>,
        update: SpaceConnector.clientV2.costAnalysis.budget.update<BudgetUpdateParameters, BudgetModel>,
        delete: SpaceConnector.clientV2.costAnalysis.budget.delete<BudgetDeleteParameters, BudgetModel>,
        setNotification: SpaceConnector.clientV2.costAnalysis.budget.setNotification<BudgetSetNotificationParameters, BudgetModel>,
    };

    return {
        budgetAPI: actions,
    };
};
