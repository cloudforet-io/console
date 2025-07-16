import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ResourceSearchParameters, ResourceSearchResponse } from '@/api-clients/search/resource/schema/api-verbs/search';


export const useResourceApi = () => {
    const actions = {
        search: SpaceConnector.clientV2.search.resource.search<ResourceSearchParameters, ResourceSearchResponse>,
    };

    return {
        resourceAPI: actions,
    };
};
