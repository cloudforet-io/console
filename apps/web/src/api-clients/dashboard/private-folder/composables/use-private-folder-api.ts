import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateFolderCreateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/create';
import type { PrivateFolderDeleteParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/delete';
import type { PrivateFolderGetParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/get';
import type { PrivateFolderListParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/list';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';


export const usePrivateFolderApi = () => {
    const action = {
        create: SpaceConnector.clientV2.dashboard.privateFolder.create<PrivateFolderCreateParameters, PrivateFolderModel>,
        update: SpaceConnector.clientV2.dashboard.privateFolder.update<PrivateFolderUpdateParameters, PrivateFolderModel>,
        delete: SpaceConnector.clientV2.dashboard.privateFolder.delete<PrivateFolderDeleteParameters>,
        get: SpaceConnector.clientV2.dashboard.privateFolder.get<PrivateFolderGetParameters, PrivateFolderModel>,
        list: SpaceConnector.clientV2.dashboard.privateFolder.list<PrivateFolderListParameters, ListResponse<PrivateFolderModel>>,
    };

    return {
        privateFolderAPI: action,
    };
};
