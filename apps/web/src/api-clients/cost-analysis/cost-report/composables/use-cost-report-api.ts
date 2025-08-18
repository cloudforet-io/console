import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportGetParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/get';
import type { CostReportGetUrlParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/get-url';
import type { CostReportListParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/list';
import type { CostReportSendParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/send';
import type { CostReportDataLinkInfoModel, CostReportModel } from '@/api-clients/cost-analysis/cost-report/schema/model';

export const useCostReportApi = () => {
    const actions = {
        get: SpaceConnector.clientV2.costAnalysis.costReport.get<CostReportGetParameters, CostReportModel>,
        list: SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>,
        send: SpaceConnector.clientV2.costAnalysis.costReport.send<CostReportSendParameters, void>,
        getUrl: SpaceConnector.clientV2.costAnalysis.costReport.getUrl<CostReportGetUrlParameters, CostReportDataLinkInfoModel>,
    };

    return {
        costReportAPI: actions,
    };
};
