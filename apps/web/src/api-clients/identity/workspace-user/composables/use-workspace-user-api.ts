import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceUserCreateParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/create';
import type { FindWorkspaceUserParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/find';
import type { WorkspaceUserGetParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/get';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

export const useWorkspaceUserApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.workspaceUser.create<WorkspaceUserCreateParameters, WorkspaceUserModel>,
        get: SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserGetParameters, WorkspaceUserModel>,
        list: SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>,
        find: SpaceConnector.clientV2.identity.workspaceUser.find<FindWorkspaceUserParameters, WorkspaceUserModel>,
    };

    return {
        workspaceUserAPI: actions,
    };
};
