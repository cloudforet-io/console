import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PublicConfigCreateParameters } from '@/api-clients/config/public-config/schema/api-verbs/create';
import type { PublicConfigGetParameters as PublicConfigDeleteParameters } from '@/api-clients/config/public-config/schema/api-verbs/delete';
import type { PublicConfigGetParameters } from '@/api-clients/config/public-config/schema/api-verbs/get';
import type { PublicConfigListParameters } from '@/api-clients/config/public-config/schema/api-verbs/list';
import type { PublicConfigSetParameters } from '@/api-clients/config/public-config/schema/api-verbs/set';
import type { PublicConfigUpdateParameters } from '@/api-clients/config/public-config/schema/api-verbs/update';
import type { PublicConfigModel } from '@/api-clients/config/public-config/schema/model';

export const usePublicConfigApi = () => {
    const publicConfigQueryKey = useAPIQueryKey('config', 'public-config', 'get');
    const publicConfigListQueryKey = useAPIQueryKey('config', 'public-config', 'list');

    const actions = {
        create: SpaceConnector.clientV2.config.publicConfig.create<PublicConfigCreateParameters, PublicConfigModel>,
        update: SpaceConnector.clientV2.config.publicConfig.update<PublicConfigUpdateParameters, PublicConfigModel>,
        delete: SpaceConnector.clientV2.config.publicConfig.delete<PublicConfigDeleteParameters>,
        get: SpaceConnector.clientV2.config.publicConfig.get<PublicConfigGetParameters, PublicConfigModel>,
        list: SpaceConnector.clientV2.config.publicConfig.list<PublicConfigListParameters, ListResponse<PublicConfigModel>>,
        set: SpaceConnector.clientV2.config.publicConfig.set<PublicConfigSetParameters, PublicConfigModel>,
    };

    return {
        publicConfigQueryKey,
        publicConfigListQueryKey,
        publicConfigAPI: actions,
    };
};
