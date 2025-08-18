import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceQuerySetListParameters } from '@/api-clients/inventory/cloud-service-query-set/schema/api-verbs/list';
import type { CloudServiceQuerySetModel } from '@/api-clients/inventory/cloud-service-query-set/schema/model';

export const useCloudServiceQuerySetApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.cloudServiceQuerySet.list<CloudServiceQuerySetListParameters, ListResponse<CloudServiceQuerySetModel>>,
    };
    return {
        cloudServiceQuerySetAPI: actions,
    };
};
