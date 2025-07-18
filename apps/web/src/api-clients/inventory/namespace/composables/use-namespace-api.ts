import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';
import type { NamespaceGetParameters } from '@/api-clients/inventory/namespace/schema/api-verbs/get';
import type { NamespaceListParameters } from '@/api-clients/inventory/namespace/schema/api-verbs/list';
import type { NamespaceStatParameters } from '@/api-clients/inventory/namespace/schema/api-verbs/stat';
import type { NamespaceModel } from '@/api-clients/inventory/namespace/schema/model';

export const useNamespaceApi = () => {
    const actions = {
        get: SpaceConnector.clientV2.inventory.namespace.get<NamespaceGetParameters, NamespaceModel>,
        list: SpaceConnector.clientV2.inventory.namespace.list<NamespaceListParameters, ListResponse<NamespaceModel>>,
        stat: SpaceConnector.clientV2.inventory.namespace.stat<NamespaceStatParameters, StatResponse>,
    };

    return {
        namespaceAPI: actions,
    };
};
