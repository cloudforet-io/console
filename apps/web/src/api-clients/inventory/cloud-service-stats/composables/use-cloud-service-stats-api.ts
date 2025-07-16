import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CloudServiceStatsAnalyzeParameters } from '@/api-clients/inventory/cloud-service-stats/schema/api-verbs/analyze';
import type { CloudServiceStatModel } from '@/api-clients/inventory/cloud-service-stats/schema/model';

export const useCloudServiceStatsApi = () => {
    const actions = {
        analyze: SpaceConnector.clientV2.inventory.cloudServiceStats.analyze<CloudServiceStatsAnalyzeParameters, CloudServiceStatModel>,
    };
    return {
        cloudServiceStatsAPI: actions,
    };
};
