import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ReportAdjustmentPolicyChangeOrderParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/change-order';
import type { ReportAdjustmentPolicyCreateParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/create';
import type { ReportAdjustmentPolicyDeleteParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/delete';
import type { ReportAdjustmentPolicyGetParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/get';
import type { ReportAdjustmentPolicyListParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/list';
import type { ReportAdjustmentPolicySyncCurrencyParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/sync-currency';
import type { ReportAdjustmentPolicyUpdateParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/update';
import type { ReportAdjustmentPolicyModel } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/model';



interface UseReportAdjustmentPolicyApiReturn {
    reportAdjustmentPolicyAPI: {
        update: (params: ReportAdjustmentPolicyUpdateParameters) => Promise<ReportAdjustmentPolicyModel>;
        list: (params: ReportAdjustmentPolicyListParameters) => Promise<ListResponse<ReportAdjustmentPolicyModel>>;
        create: (params: ReportAdjustmentPolicyCreateParameters) => Promise<ReportAdjustmentPolicyModel>;
        delete: (params: ReportAdjustmentPolicyDeleteParameters) => Promise<ReportAdjustmentPolicyModel>;
        changeOrder: (params: ReportAdjustmentPolicyChangeOrderParameters) => Promise<ReportAdjustmentPolicyModel>;
        get: (params: ReportAdjustmentPolicyGetParameters) => Promise<ReportAdjustmentPolicyModel>;
        syncCurrency: (params: ReportAdjustmentPolicySyncCurrencyParameters) => Promise<ReportAdjustmentPolicyModel>;
    }
}

export const useReportAdjustmentPolicyApi = (): UseReportAdjustmentPolicyApiReturn => {
    const actions = {
        update: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.update<ReportAdjustmentPolicyUpdateParameters, ReportAdjustmentPolicyModel>,
        list: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.list<ReportAdjustmentPolicyListParameters, ListResponse<ReportAdjustmentPolicyModel>>,
        create: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.create<ReportAdjustmentPolicyCreateParameters, ReportAdjustmentPolicyModel>,
        delete: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.delete<ReportAdjustmentPolicyDeleteParameters, ReportAdjustmentPolicyModel>,
        changeOrder: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.changeOrder<ReportAdjustmentPolicyChangeOrderParameters, ReportAdjustmentPolicyModel>,
        get: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.get<ReportAdjustmentPolicyGetParameters, ReportAdjustmentPolicyModel>,
        syncCurrency: SpaceConnector.clientV2.costAnalysis.reportAdjustmentPolicy.syncCurrency<ReportAdjustmentPolicySyncCurrencyParameters, ReportAdjustmentPolicyModel>,
    };

    return {
        reportAdjustmentPolicyAPI: actions,
    };
};
