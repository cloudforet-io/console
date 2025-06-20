import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceTypeListParameters } from '@/api-clients/inventory/cloud-service-type/schema/api-verbs/list';
import type { CloudServiceTypeStatParameters } from '@/api-clients/inventory/cloud-service-type/schema/api-verbs/stat';
import type { CloudServiceTypeModel } from '@/api-clients/inventory/cloud-service-type/schema/model';


export const useCloudServiceTypeApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.cloudServiceType.list<CloudServiceTypeListParameters, ListResponse<CloudServiceTypeModel>>,
        stat: SpaceConnector.clientV2.inventory.cloudServiceType.stat<CloudServiceTypeStatParameters, any>,
    };

    return {
        cloudServiceTypeAPI: actions,
    };
};
