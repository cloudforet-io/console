import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceAnalyzeParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/analyze';
import type { CloudServiceGetParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/get';
import type { CloudServiceListParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/list';
import type { CloudServiceModel } from '@/api-clients/inventory/cloud-service/schema/model';

export const useCloudServiceApi = () => {
    const actions = {
        analyze: SpaceConnector.clientV2.inventory.cloudService.analyze<CloudServiceAnalyzeParameters>,
        get: SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>,
        list: SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>,
    };
    return {
        cloudServiceAPI: actions,
    };
};
