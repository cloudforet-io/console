import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProviderCreateParameters } from '@/api-clients/identity/provider/schema/api-verbs/create';
import type { ProviderDeleteParameters } from '@/api-clients/identity/provider/schema/api-verbs/delete';
import type { ProviderGetParameters } from '@/api-clients/identity/provider/schema/api-verbs/get';
import type { ProviderListParameters } from '@/api-clients/identity/provider/schema/api-verbs/list';
import type { ProviderStatParameters } from '@/api-clients/identity/provider/schema/api-verbs/stat';
import type { ProviderUpdateParameters } from '@/api-clients/identity/provider/schema/api-verbs/update';
import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';


export const useProviderApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.provider.create<ProviderCreateParameters, ProviderModel>,
        update: SpaceConnector.clientV2.identity.provider.update<ProviderUpdateParameters, ProviderModel>,
        delete: SpaceConnector.clientV2.identity.provider.delete<ProviderDeleteParameters>,
        get: SpaceConnector.clientV2.identity.provider.get<ProviderGetParameters, ProviderModel>,
        list: SpaceConnector.clientV2.identity.provider.list<ProviderListParameters, ListResponse<ProviderModel>>,
        stat: SpaceConnector.clientV2.identity.provider.stat<ProviderStatParameters, any>,
    };

    return {
        providerAPI: actions,
    };
};
