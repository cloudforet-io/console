import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateFolderCreateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/create';
import type { PrivateFolderDeleteParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/delete';
import type { PrivateFolderGetParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/get';
import type { PrivateFolderListParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/list';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';

interface UsePrivateFolderApiReturn {
    privateFolderAPI: {
        create: (params: PrivateFolderCreateParameters) => Promise<PrivateFolderModel>;
        update: (params: PrivateFolderUpdateParameters) => Promise<PrivateFolderModel>;
        delete: (params: PrivateFolderDeleteParameters) => Promise<void>;
        get: (params: PrivateFolderGetParameters) => Promise<PrivateFolderModel>;
        list: (params: PrivateFolderListParameters) => Promise<ListResponse<PrivateFolderModel>>;
    };
}

export const usePrivateFolderApi = (): UsePrivateFolderApiReturn => {
    const action = {
        async create(params: PrivateFolderCreateParameters) {
            return SpaceConnector.clientV2.dashboard.privateFolder.create<PrivateFolderCreateParameters, PrivateFolderModel>(params);
        },
        async update(params: PrivateFolderUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.privateFolder.update<PrivateFolderUpdateParameters, PrivateFolderModel>(params);
        },
        async delete(params: PrivateFolderDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.privateFolder.delete<PrivateFolderDeleteParameters>(params);
        },
        async get(params: PrivateFolderGetParameters) {
            return SpaceConnector.clientV2.dashboard.privateFolder.get<PrivateFolderGetParameters, PrivateFolderModel>(params);
        },
        async list(params: PrivateFolderListParameters) {
            return SpaceConnector.clientV2.dashboard.privateFolder.list<PrivateFolderListParameters, ListResponse<PrivateFolderModel>>(params);
        },
    };

    return {
        privateFolderAPI: action,
    };
};
