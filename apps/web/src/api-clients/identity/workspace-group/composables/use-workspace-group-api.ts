import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceGroupAddUsersParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/add-users';
import type { WorkspaceGroupCreateParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/create';
import type { WorkspaceGroupDeleteParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/delete';
import type { WorkspaceGroupGetParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/get';
import type { WorkspaceGroupListParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/list';
import type { WorkspaceGroupRemoveUsersParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/remove-users';
import type { WorkspaceGroupStatParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/stat';
import type { WorkspaceGroupUpdateParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/update';
import type { WorkspaceGroupUpdateRoleParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/update-role';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';

export const useWorkspaceGroupApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.workspaceGroup.create<WorkspaceGroupCreateParameters, WorkspaceGroupModel>,
        update: SpaceConnector.clientV2.identity.workspaceGroup.update<WorkspaceGroupUpdateParameters, WorkspaceGroupModel>,
        delete: SpaceConnector.clientV2.identity.workspaceGroup.delete<WorkspaceGroupDeleteParameters>,
        get: SpaceConnector.clientV2.identity.workspaceGroup.get<WorkspaceGroupGetParameters, WorkspaceGroupModel>,
        list: SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>,
        addUsers: SpaceConnector.clientV2.identity.workspaceGroup.addUsers<WorkspaceGroupAddUsersParameters, WorkspaceGroupModel>,
        removeUsers: SpaceConnector.clientV2.identity.workspaceGroup.removeUsers<WorkspaceGroupRemoveUsersParameters, WorkspaceGroupModel>,
        updateRole: SpaceConnector.clientV2.identity.workspaceGroup.updateRole<WorkspaceGroupUpdateRoleParameters, WorkspaceGroupModel>,
        stat: SpaceConnector.clientV2.identity.workspaceGroup.stat<WorkspaceGroupStatParameters, any>,
    };

    return {
        workspaceGroupAPI: actions,
    };
};
