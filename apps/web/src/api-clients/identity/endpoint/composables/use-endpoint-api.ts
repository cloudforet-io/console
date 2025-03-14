import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EndpointListParameters } from '@/api-clients/identity/endpoint/schema/api-verbs/list';
import type { EndpointModel } from '@/api-clients/identity/endpoint/schema/model';

export const useEndpointApi = () => {
    const endpointListQueryKey = useAPIQueryKey('identity', 'endpoint', 'list');

    const actions = {
        list: SpaceConnector.clientV2.identity.endpoint.list<EndpointListParameters, ListResponse<EndpointModel>>,
    };

    return {
        endpointListQueryKey,
        endpointAPI: actions,
    };
};
