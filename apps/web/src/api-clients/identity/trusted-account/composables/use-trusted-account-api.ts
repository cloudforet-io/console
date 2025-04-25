import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TrustedAccountCreateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/create';
import type { TrustedAccountDeleteParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/detele';
import type { TrustedAccountGetParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/get';
import type { TrustedAccountListParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/list';
import type { TrustedAccountStatParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/stat';
import type { TrustedAccountUpdateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update';
import type { TrustedAccountUpdateSecretDataParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update-secret-data';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';


export const useTrustedAccountApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.trustedAccount.create<TrustedAccountCreateParameters, TrustedAccountModel>,
        update: SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>,
        delete: SpaceConnector.clientV2.identity.trustedAccount.delete<TrustedAccountDeleteParameters>,
        get: SpaceConnector.clientV2.identity.trustedAccount.get<TrustedAccountGetParameters, TrustedAccountModel>,
        list: SpaceConnector.clientV2.identity.trustedAccount.list<TrustedAccountListParameters, ListResponse<TrustedAccountModel>>,
        stat: SpaceConnector.clientV2.identity.trustedAccount.stat<TrustedAccountStatParameters, any>,
        updateSecretData: SpaceConnector.clientV2.identity.trustedAccount.updateSecretData<TrustedAccountUpdateSecretDataParameters, TrustedAccountModel>,
    };

    return {
        trustedAccountAPI: actions,
    };
};
