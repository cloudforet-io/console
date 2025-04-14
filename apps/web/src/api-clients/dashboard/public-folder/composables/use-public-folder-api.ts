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

export const usePublicFolderApi = () => {
    const action = {
        create: SpaceConnector.clientV2.dashboard.publicFolder.create<PublicFolderCreateParameters, PublicFolderModel>,
        update: SpaceConnector.clientV2.dashboard.publicFolder.update<PublicFolderUpdateParameters, PublicFolderModel>,
        share: SpaceConnector.clientV2.dashboard.publicFolder.share<PublicFolderShareParameters, PublicFolderModel>,
        unshare: SpaceConnector.clientV2.dashboard.publicFolder.unshare<PublicFolderUnshareParameters, PublicFolderModel>,
        delete: SpaceConnector.clientV2.dashboard.publicFolder.delete<PublicFolderDeleteParameters>,
        get: SpaceConnector.clientV2.dashboard.publicFolder.get<PublicFolderGetParameters, PublicFolderModel>,
        list: SpaceConnector.clientV2.dashboard.publicFolder.list<PublicFolderListParameters, ListResponse<PublicFolderModel>>,
    };

    return {
        publicFolderAPI: action,
    };
};
