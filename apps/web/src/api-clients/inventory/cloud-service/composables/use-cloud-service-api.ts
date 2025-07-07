import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { ExportParameter, ExportResponse } from '@/api-clients/_common/schema/api-verbs/export';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceAnalyzeParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/analyze';
import type { CloudServiceGetParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/get';
import type { CloudServiceGetDataParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/get-data';
import type { CloudServiceListParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/list';
import type { CloudServiceModel } from '@/api-clients/inventory/cloud-service/schema/model';
import type { CloudServiceAnalyzeResult } from '@/api-clients/inventory/cloud-service/schema/type';


export const useCloudServiceApi = () => {
    const actions = {
        analyze: SpaceConnector.clientV2.inventory.cloudService.analyze<CloudServiceAnalyzeParameters, AnalyzeResponse<CloudServiceAnalyzeResult>>,
        get: SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>,
        getData: SpaceConnector.client.inventory.cloudService.getData<CloudServiceGetDataParameters>,
        list: SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>,
        export: SpaceConnector.clientV2.inventory.cloudService.export<ExportParameter, ExportResponse>,
    };
    return {
        cloudServiceAPI: actions,
    };
};
