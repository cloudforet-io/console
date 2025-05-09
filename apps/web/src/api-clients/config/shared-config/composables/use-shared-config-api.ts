import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SharedConfigCreateParameters } from '@/api-clients/config/shared-config/schema/api-verbs/create';
import type { SharedConfigDeleteParameters } from '@/api-clients/config/shared-config/schema/api-verbs/delete';
import type { SharedConfigGetParameters } from '@/api-clients/config/shared-config/schema/api-verbs/get';
import type { SharedConfigListParameters } from '@/api-clients/config/shared-config/schema/api-verbs/list';
import type { SharedConfigUpdateParameters } from '@/api-clients/config/shared-config/schema/api-verbs/update';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';

export const useSharedConfigApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.config.sharedConfig.create<SharedConfigCreateParameters, SharedConfigModel>,
        update: SpaceConnector.clientV2.config.sharedConfig.update<SharedConfigUpdateParameters, SharedConfigModel>,
        delete: SpaceConnector.clientV2.config.sharedConfig.delete<SharedConfigDeleteParameters>,
        get: SpaceConnector.clientV2.config.sharedConfig.get<SharedConfigGetParameters, SharedConfigModel>,
        list: SpaceConnector.clientV2.config.sharedConfig.list<SharedConfigListParameters, ListResponse<SharedConfigModel>>,
    };

    return {
        sharedConfigAPI: actions,
    };
};
