import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceAccountCreateParameters } from '@/api-clients/identity/service-account/schema/api-verbs/create';
import type { ServiceAccountDeleteParameters } from '@/api-clients/identity/service-account/schema/api-verbs/detele';
import type { ServiceAccountDeleteSecretDataParameters } from '@/api-clients/identity/service-account/schema/api-verbs/detele-secret-data';
import type { ServiceAccountGetParameters } from '@/api-clients/identity/service-account/schema/api-verbs/get';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountStatParameters } from '@/api-clients/identity/service-account/schema/api-verbs/stat';
import type { ServiceAccountUpdateParameters } from '@/api-clients/identity/service-account/schema/api-verbs/update';
import type { ServiceAccountUpdateSecretDataParameters } from '@/api-clients/identity/service-account/schema/api-verbs/update-secret-data';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';


export const useServiceAccountApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.serviceAccount.create<ServiceAccountCreateParameters, ServiceAccountModel>,
        update: SpaceConnector.clientV2.identity.serviceAccount.update<ServiceAccountUpdateParameters, ServiceAccountModel>,
        delete: SpaceConnector.clientV2.identity.serviceAccount.delete<ServiceAccountDeleteParameters>,
        get: SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>,
        list: SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>,
        stat: SpaceConnector.clientV2.identity.serviceAccount.stat<ServiceAccountStatParameters, any>,
        updateSecretData: SpaceConnector.clientV2.identity.serviceAccount.updateSecretData<ServiceAccountUpdateSecretDataParameters, ServiceAccountModel>,
        deleteSecretData: SpaceConnector.clientV2.identity.serviceAccount.deleteSecretData<ServiceAccountDeleteSecretDataParameters>,
    };

    return {
        serviceAccountAPI: actions,
    };
};
