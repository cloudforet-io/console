import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';

import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';

import type { CostReportDataAnalyzeParameters } from '../schema/api-verbs/analyze';

interface UseCostReportDataApiReturn {
    costReportDataAPI: {
        analyze: (params: CostReportDataAnalyzeParameters) => Promise<AnalyzeResponse<CostReportDataAnalyzeResult>>;
    }
}
export const useCostReportDataApi = (): UseCostReportDataApiReturn => {
    const actions = {
        analyze: SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>,
    };

    return {
        costReportDataAPI: actions,
    };
};
