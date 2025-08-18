import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { JobAnalyzeParameters } from '@/api-clients/inventory/job/schema/api-verbs/analyze';
import type { JobGetParameters } from '@/api-clients/inventory/job/schema/api-verbs/get';
import type { JobListParameters } from '@/api-clients/inventory/job/schema/api-verbs/list';
import type { JobModel } from '@/api-clients/inventory/job/schema/model';

export const useInventoryJobApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.job.list<JobListParameters, ListResponse<JobModel>>,
        analyze: SpaceConnector.clientV2.inventory.job.analyze<JobAnalyzeParameters, ListResponse<JobModel>>,
        get: SpaceConnector.clientV2.inventory.job.get<JobGetParameters, JobModel>,
    };

    return {
        jobAPI: actions,
    };
};
