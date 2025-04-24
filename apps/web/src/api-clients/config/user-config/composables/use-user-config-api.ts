import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigCreateParameters } from '@/api-clients/config/user-config/schema/api-verbs/create';
import type { UserConfigDeleteParameters } from '@/api-clients/config/user-config/schema/api-verbs/delete';
import type { UserConfigGetParameters } from '@/api-clients/config/user-config/schema/api-verbs/get';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import type { UserConfigSetParameters } from '@/api-clients/config/user-config/schema/api-verbs/set';
import type { UserConfigUpdateParameters } from '@/api-clients/config/user-config/schema/api-verbs/update';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';

export const useUserConfigApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.config.userConfig.create<UserConfigCreateParameters, UserConfigModel>,
        update: SpaceConnector.clientV2.config.userConfig.update<UserConfigUpdateParameters, UserConfigModel>,
        delete: SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters>,
        get: SpaceConnector.clientV2.config.userConfig.get<UserConfigGetParameters, UserConfigModel>,
        list: SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>,
        set: SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>,
    };

    return {
        userConfigAPI: actions,
    };
};
