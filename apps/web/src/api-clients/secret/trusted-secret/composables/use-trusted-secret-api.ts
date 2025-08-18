import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TrustedSecretCreateParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/create';
import type { TrustedSecretDeleteParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/delete';
import type { TrustedSecretGetParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/get';
import type { TrustedSecretListParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/list';
import type { TrustedSecretUpdateParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/update';
import type { TrustedSecretUpdateDataParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/update-data';
import type { TrustedSecretDataModel, TrustedSecretModel } from '@/api-clients/secret/trusted-secret/schema/model';

export const useTrustedSecretApi = () => {
    const actions = {
        get: SpaceConnector.clientV2.secret.trustedSecret.get<TrustedSecretGetParameters, TrustedSecretModel>,
        list: SpaceConnector.clientV2.secret.trustedSecret.list<TrustedSecretListParameters, ListResponse<TrustedSecretModel>>,
        create: SpaceConnector.clientV2.secret.trustedSecret.create<TrustedSecretCreateParameters, TrustedSecretModel>,
        update: SpaceConnector.clientV2.secret.trustedSecret.update<TrustedSecretUpdateParameters, TrustedSecretModel>,
        delete: SpaceConnector.clientV2.secret.trustedSecret.delete<TrustedSecretDeleteParameters>,
        updateData: SpaceConnector.clientV2.secret.trustedSecret.updateData<TrustedSecretUpdateDataParameters, TrustedSecretDataModel>,
    };

    return {
        trustedSecretAPI: actions,
    };
};
