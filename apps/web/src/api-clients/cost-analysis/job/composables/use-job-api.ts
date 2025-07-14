import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostJobCancelParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/cancel';
import type { CostJobListParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/list';
import type { CostJobModel } from '@/api-clients/cost-analysis/job/schema/model';


export const useCostJobApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.costAnalysis.job.list<CostJobListParameters, ListResponse<CostJobModel>>,
        cancel: SpaceConnector.clientV2.costAnalysis.job.cancel<CostJobCancelParameters>,
    };

    return {
        costJobAPI: actions,
    };
};
