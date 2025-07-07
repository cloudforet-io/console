import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { JobTaskListParameters } from '@/api-clients/inventory/job-task/schema/api-verbs/list';
import type { JobTaskModel } from '@/api-clients/inventory/job-task/schema/model';

export const useInventoryJobTaskApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.jobTask.list<JobTaskListParameters, ListResponse<JobTaskModel>>,
    };

    return {
        jobTaskAPI: actions,
    };
};
