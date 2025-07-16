import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RepositoryListParameters } from '@/api-clients/repository/repository/schema/api-verbs/list';
import type { RepositoryModel } from '@/api-clients/repository/repository/schema/model';

export const useRepositoryApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.repository.repository.list<RepositoryListParameters, ListResponse<RepositoryModel>>,
    };
    return {
        repositoryAPI: actions,
    };
};
