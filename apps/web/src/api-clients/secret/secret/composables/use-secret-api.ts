import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SecretCreateParameters } from '@/api-clients/secret/secret/schema/api-verbs/create';
import type { SecretGetParameters } from '@/api-clients/secret/secret/schema/api-verbs/get';
import type { SecretListParameters } from '@/api-clients/secret/secret/schema/api-verbs/list';
import type { SecretModel } from '@/api-clients/secret/secret/schema/model';

export const useSecretApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.secret.secret.create<SecretCreateParameters, SecretModel>,
        get: SpaceConnector.clientV2.secret.secret.get<SecretGetParameters, SecretModel>,
        list: SpaceConnector.clientV2.secret.secret.list<SecretListParameters, ListResponse<SecretModel>>,
    };

    return {
        secretAPI: actions,
    };
};
