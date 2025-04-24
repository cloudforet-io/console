import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceGroupUserAddParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/add';
import type { WorkspaceGroupUserFindParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/find';
import type { WorkspaceGroupUserGetParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/get';
import type { WorkspaceGroupUserListParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/list';
import type { WorkspaceGroupUserRemoveParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/remove';
import type { WorkspaceGroupUserUpdateRoleParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/update-role';
import type { WorkspaceGroupUserModel } from '@/api-clients/identity/workspace-group-user/schema/model';

export const useWorkspaceGroupUserApi = () => {
    const actions = {
        add: SpaceConnector.clientV2.identity.workspaceGroupUser.add<WorkspaceGroupUserAddParameters, WorkspaceGroupUserModel>,
        remove: SpaceConnector.clientV2.identity.workspaceGroupUser.remove<WorkspaceGroupUserRemoveParameters>,
        get: SpaceConnector.clientV2.identity.workspaceGroupUser.get<WorkspaceGroupUserGetParameters, WorkspaceGroupUserModel>,
        list: SpaceConnector.clientV2.identity.workspaceGroupUser.list<WorkspaceGroupUserListParameters, ListResponse<WorkspaceGroupUserModel>>,
        find: SpaceConnector.clientV2.identity.workspaceGroupUser.find<WorkspaceGroupUserFindParameters, WorkspaceGroupUserModel>,
        updateRole: SpaceConnector.clientV2.identity.workspaceGroupUser.updateRole<WorkspaceGroupUserUpdateRoleParameters, WorkspaceGroupUserModel>,
        stat: SpaceConnector.clientV2.identity.workspaceGroupUser.stat<WorkspaceGroupUserListParameters, any>,
    };

    return {
        workspaceGroupUserAPI: actions,
    };
};
