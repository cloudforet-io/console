import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';
import type { RegionListParameters } from '@/api-clients/inventory/region/schema/api-verbs/list';
import type { RegionStatParameters } from '@/api-clients/inventory/region/schema/api-verbs/stat';
import type { RegionModel } from '@/api-clients/inventory/region/schema/model';

export const useRegionApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.region.list<RegionListParameters, ListResponse<RegionModel>>,
        stat: SpaceConnector.clientV2.inventory.region.stat<RegionStatParameters, StatResponse>,
    };

    return {
        regionAPI: actions,
    };
};
