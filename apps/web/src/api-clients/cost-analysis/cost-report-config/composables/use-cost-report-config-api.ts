import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportConfigListParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/list';
import type { CostReportConfigUpdateParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/update';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';


interface UseCostReportConfigApiReturn {
    costReportConfigAPI: {
        update: (params: CostReportConfigUpdateParameters) => Promise<CostReportConfigModel>;
        list: (params: CostReportConfigListParameters) => Promise<ListResponse<CostReportConfigModel>>;
    }
}

export const useCostReportConfigApi = (): UseCostReportConfigApiReturn => {
    const actions = {
        update: SpaceConnector.clientV2.costAnalysis.costReportConfig.update<CostReportConfigUpdateParameters, CostReportConfigModel>,
        list: SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>,
    };

    return {
        costReportConfigAPI: actions,
    };
};
