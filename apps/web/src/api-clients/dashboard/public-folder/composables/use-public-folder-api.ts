import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PublicFolderCreateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/create';
import type { PublicFolderDeleteParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/delete';
import type { PublicFolderGetParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/get';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';
import type { PublicFolderShareParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/share';
import type { PublicFolderUnshareParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/unshare';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';

interface UsePublicFolderApiReturn {
    publicFolderAPI: {
        create: (params: PublicFolderCreateParameters) => Promise<PublicFolderModel>;
        update: (params: PublicFolderUpdateParameters) => Promise<PublicFolderModel>;
        share: (params: PublicFolderShareParameters) => Promise<PublicFolderModel>;
        unshare: (params: PublicFolderUnshareParameters) => Promise<PublicFolderModel>;
        delete: (params: PublicFolderDeleteParameters) => Promise<void>;
        get: (params: PublicFolderGetParameters) => Promise<PublicFolderModel>;
        list: (params: PublicFolderListParameters) => Promise<ListResponse<PublicFolderModel>>;
    }
}

export const usePublicFolderApi = (): UsePublicFolderApiReturn => {
    const action = {
        async create(params: PublicFolderCreateParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.create<PublicFolderCreateParameters, PublicFolderModel>(params);
        },
        async update(params: PublicFolderUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.update<PublicFolderUpdateParameters, PublicFolderModel>(params);
        },
        async share(params: PublicFolderShareParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.share<PublicFolderShareParameters, PublicFolderModel>(params);
        },
        async unshare(params: PublicFolderUnshareParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.unshare<PublicFolderUnshareParameters, PublicFolderModel>(params);
        },
        async delete(params: PublicFolderDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.delete<PublicFolderDeleteParameters>(params);
        },
        async get(params: PublicFolderGetParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.get<PublicFolderGetParameters, PublicFolderModel>(params);
        },
        async list(params: PublicFolderListParameters) {
            return SpaceConnector.clientV2.dashboard.publicFolder.list<PublicFolderListParameters, ListResponse<PublicFolderModel>>(params);
        },
    };

    return {
        publicFolderAPI: action,
    };
};
