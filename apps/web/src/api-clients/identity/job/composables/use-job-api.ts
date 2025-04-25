import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { IdentityJobDeleteParameters } from '@/api-clients/identity/job/schema/api-verbs/delete';
import type { IdentityJobGetParameters } from '@/api-clients/identity/job/schema/api-verbs/get';
import type { IdentityJobListParameters } from '@/api-clients/identity/job/schema/api-verbs/list';
import type { IdentityJobStatParameters } from '@/api-clients/identity/job/schema/api-verbs/stat';
import type { IdentityJobModel } from '@/api-clients/identity/job/schema/model';

export const useJobApi = () => {
    const actions = {
        delete: SpaceConnector.clientV2.identity.job.delete<IdentityJobDeleteParameters>,
        get: SpaceConnector.clientV2.identity.job.get<IdentityJobGetParameters, IdentityJobModel>,
        list: SpaceConnector.clientV2.identity.job.list<IdentityJobListParameters, ListResponse<IdentityJobModel>>,
        stat: SpaceConnector.clientV2.identity.job.stat<IdentityJobStatParameters, any>,
    };

    return {
        jobAPI: actions,
    };
};
