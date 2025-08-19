import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SecretCreateParameters } from '@/api-clients/secret/secret/schema/api-verbs/create';
import type { SecretGetParameters } from '@/api-clients/secret/secret/schema/api-verbs/get';
import type { SecretListParameters } from '@/api-clients/secret/secret/schema/api-verbs/list';
import type { SecretModel } from '@/api-clients/secret/secret/schema/model';
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

export const useSecretApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('secret');

    const actions = {
        create: wrapResourceCacheRefresh(SpaceConnector.clientV2.secret.secret.create<SecretCreateParameters, SecretModel>),
        get: SpaceConnector.clientV2.secret.secret.get<SecretGetParameters, SecretModel>,
        list: SpaceConnector.clientV2.secret.secret.list<SecretListParameters, ListResponse<SecretModel>>,
    };

    return {
        secretAPI: actions,
    };
};
