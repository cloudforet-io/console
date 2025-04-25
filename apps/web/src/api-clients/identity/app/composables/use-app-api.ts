import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AppCreateParameters } from '@/api-clients/identity/app/schema/api-verbs/create';
import type { AppDeleteParameters } from '@/api-clients/identity/app/schema/api-verbs/delete';
import type { AppDisableParameters } from '@/api-clients/identity/app/schema/api-verbs/disable';
import type { AppEnableParameters } from '@/api-clients/identity/app/schema/api-verbs/enable';
import type { AppGenerateApiKeyParameters } from '@/api-clients/identity/app/schema/api-verbs/generateApiKey';
import type { AppGetParameters } from '@/api-clients/identity/app/schema/api-verbs/get';
import type { AppListParameters } from '@/api-clients/identity/app/schema/api-verbs/list';
import type { AppStatParameters } from '@/api-clients/identity/app/schema/api-verbs/stat';
import type { AppUpdateParameters } from '@/api-clients/identity/app/schema/api-verbs/update';
import type { AppModel } from '@/api-clients/identity/app/schema/model';

export const useAppApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.app.create<AppCreateParameters, AppModel>,
        update: SpaceConnector.clientV2.identity.app.update<AppUpdateParameters, AppModel>,
        delete: SpaceConnector.clientV2.identity.app.delete<AppDeleteParameters>,
        get: SpaceConnector.clientV2.identity.app.get<AppGetParameters, AppModel>,
        list: SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>,
        enable: SpaceConnector.clientV2.identity.app.enable<AppEnableParameters, AppModel>,
        disable: SpaceConnector.clientV2.identity.app.disable<AppDisableParameters, AppModel>,
        generateApiKey: SpaceConnector.clientV2.identity.app.generateApiKey<AppGenerateApiKeyParameters, { api_key: string }>,
        stat: SpaceConnector.clientV2.identity.app.stat<AppStatParameters, any>,
    };

    return {
        appAPI: actions,
    };
};
