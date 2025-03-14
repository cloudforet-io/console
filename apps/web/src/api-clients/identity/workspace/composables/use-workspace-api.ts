import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceAddPackageParameters } from '@/api-clients/identity/workspace/schema/api-verbs/add-package';
import type { WorkspaceChangeWorkspaceGroupParameters } from '@/api-clients/identity/workspace/schema/api-verbs/change-workspace-group';
import type { WorkspaceCreateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/create';
import type { WorkspaceDeleteParameters } from '@/api-clients/identity/workspace/schema/api-verbs/delete';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceRemovePackageParameters } from '@/api-clients/identity/workspace/schema/api-verbs/remove-package';
import type { WorkspaceUpdateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/update';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

export const useWorkspaceApi = () => {
    const workspaceQueryKey = useAPIQueryKey('identity', 'workspace', 'get');
    const workspaceListQueryKey = useAPIQueryKey('identity', 'workspace', 'list');

    const actions = {
        create: SpaceConnector.clientV2.identity.workspace.create<WorkspaceCreateParameters, WorkspaceModel>,
        update: SpaceConnector.clientV2.identity.workspace.update<WorkspaceUpdateParameters, WorkspaceModel>,
        delete: SpaceConnector.clientV2.identity.workspace.delete<WorkspaceDeleteParameters>,
        list: SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>,
        addPackage: SpaceConnector.clientV2.identity.workspace.addPackage<WorkspaceAddPackageParameters, WorkspaceModel>,
        removePackage: SpaceConnector.clientV2.identity.workspace.removePackage<WorkspaceRemovePackageParameters, WorkspaceModel>,
        changeWorkspaceGroup: SpaceConnector.clientV2.identity.workspace.changeWorkspaceGroup<WorkspaceChangeWorkspaceGroupParameters, WorkspaceModel>,
    };

    return {
        workspaceQueryKey,
        workspaceListQueryKey,
        workspaceAPI: actions,
    };
};
