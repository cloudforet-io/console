import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceAccountAnalyzeParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/analyze';
import type { CostDataSourceAccountListParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/list';
import type { CostDataSourceAccountResetParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/reset';
import type { CostDataSourceAccountUpdateParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/update';
import type { CostDataSourceAccountModel, CostDataSourceAnalyzeModel } from '@/api-clients/cost-analysis/data-source-account/schema/model';

export const useDataSourceAccountApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.costAnalysis.dataSourceAccount.list<CostDataSourceAccountListParameters, ListResponse<CostDataSourceAccountModel>>,
        update: SpaceConnector.clientV2.costAnalysis.dataSourceAccount.update<CostDataSourceAccountUpdateParameters, CostDataSourceAccountModel>,
        reset: SpaceConnector.clientV2.costAnalysis.dataSourceAccount.reset<CostDataSourceAccountResetParameters>,
        analyze: SpaceConnector.clientV2.costAnalysis.dataSourceAccount.analyze<CostDataSourceAccountAnalyzeParameters, CostDataSourceAnalyzeModel>,
    };

    return {
        dataSourceAccountAPI: actions,
    };
};
