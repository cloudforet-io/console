import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EndpointListParameters } from '@/api-clients/identity/endpoint/schema/api-verbs/list';
import type { EndpointModel } from '@/api-clients/identity/endpoint/schema/model';

export const useEndpointApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.identity.endpoint.list<EndpointListParameters, ListResponse<EndpointModel>>,
    };

    return {
        endpointAPI: actions,
    };
};
