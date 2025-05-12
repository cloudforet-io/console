import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ReportAdjustmentChangeOrderParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/change-order';
import type { ReportAdjustmentCreateParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/create';
import type { ReportAdjustmentDeleteParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/delete';
import type { ReportAdjustmentGetParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/get';
import type { ReportAdjustmentListParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/list';
import type { ReportAdjustmentUpdateParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/update';
import type { ReportAdjustmentModel } from '@/api-clients/cost-analysis/report-adjustment/schema/model';

interface UseReportAdjustmentApiReturn {
    reportAdjustmentAPI: {
        update: (params: ReportAdjustmentUpdateParameters) => Promise<ReportAdjustmentModel>;
        list: (params: ReportAdjustmentListParameters) => Promise<ListResponse<ReportAdjustmentModel>>;
        create: (params: ReportAdjustmentCreateParameters) => Promise<ReportAdjustmentModel>;
        delete: (params: ReportAdjustmentDeleteParameters) => Promise<ReportAdjustmentModel>;
        changeOrder: (params: ReportAdjustmentChangeOrderParameters) => Promise<ReportAdjustmentModel>;
        get: (params: ReportAdjustmentGetParameters) => Promise<ReportAdjustmentModel>;
    }
}

export const useReportAdjustmentApi = (): UseReportAdjustmentApiReturn => {
    const actions = {
        update: SpaceConnector.clientV2.costAnalysis.reportAdjustment.update<ReportAdjustmentUpdateParameters, ReportAdjustmentModel>,
        list: SpaceConnector.clientV2.costAnalysis.reportAdjustment.list<ReportAdjustmentListParameters, ListResponse<ReportAdjustmentModel>>,
        create: SpaceConnector.clientV2.costAnalysis.reportAdjustment.create<ReportAdjustmentCreateParameters, ReportAdjustmentModel>,
        delete: SpaceConnector.clientV2.costAnalysis.reportAdjustment.delete<ReportAdjustmentDeleteParameters, ReportAdjustmentModel>,
        changeOrder: SpaceConnector.clientV2.costAnalysis.reportAdjustment.changeOrder<ReportAdjustmentChangeOrderParameters, ReportAdjustmentModel>,
        get: SpaceConnector.clientV2.costAnalysis.reportAdjustment.get<ReportAdjustmentGetParameters, ReportAdjustmentModel>,
    };

    return {
        reportAdjustmentAPI: actions,
    };
};
