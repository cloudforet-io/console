import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceAddPackageParameters } from '@/api-clients/identity/workspace/api-verbs/add-package';
import type { WorkspaceChangeWorkspaceGroupParameters } from '@/api-clients/identity/workspace/api-verbs/change-workspace-group';
import type { WorkspaceCreateParameters } from '@/api-clients/identity/workspace/api-verbs/create';
import type { WorkspaceDeleteParameters } from '@/api-clients/identity/workspace/api-verbs/delete';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/api-verbs/list';
import type { WorkspaceRemovePackageParameters } from '@/api-clients/identity/workspace/api-verbs/remove-package';
import type { WorkspaceUpdateParameters } from '@/api-clients/identity/workspace/api-verbs/update';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/model';

interface UseWorkspaceApiReturn {
    workspaceQueryKey: ComputedRef<QueryKey>;
    workspaceListQueryKey: ComputedRef<QueryKey>;
    workspaceAPI: {
        create: (params: WorkspaceCreateParameters) => Promise<WorkspaceModel>;
        update: (params: WorkspaceUpdateParameters) => Promise<WorkspaceModel>;
        delete: (params: WorkspaceDeleteParameters) => Promise<void>;
        list: (params: WorkspaceListParameters) => Promise<ListResponse<WorkspaceModel>>;
        addPackage: (params: WorkspaceAddPackageParameters) => Promise<WorkspaceModel>;
        removePackage: (params: WorkspaceRemovePackageParameters) => Promise<WorkspaceModel>;
        changeWorkspaceGroup: (params: WorkspaceChangeWorkspaceGroupParameters) => Promise<WorkspaceModel>;
    }
}

export const useWorkspaceApi = (): UseWorkspaceApiReturn => {
    const workspaceQueryKey = useAPIQueryKey('identity', 'workspace', 'get');
    const workspaceListQueryKey = useAPIQueryKey('identity', 'workspace', 'list');

    const actions = {
        async create(params: WorkspaceCreateParameters) {
            return SpaceConnector.clientV2.identity.workspace.create<WorkspaceCreateParameters, WorkspaceModel>(params);
        },
        async update(params: WorkspaceUpdateParameters) {
            return SpaceConnector.clientV2.identity.workspace.update<WorkspaceUpdateParameters, WorkspaceModel>(params);
        },
        async delete(params: WorkspaceDeleteParameters) {
            return SpaceConnector.clientV2.identity.workspace.delete<WorkspaceDeleteParameters>(params);
        },
        async list(params: WorkspaceListParameters) {
            return SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>(params);
        },
        async addPackage(params: WorkspaceAddPackageParameters) {
            return SpaceConnector.clientV2.identity.workspace.addPackage<WorkspaceAddPackageParameters, WorkspaceModel>(params);
        },
        async removePackage(params: WorkspaceRemovePackageParameters) {
            return SpaceConnector.clientV2.identity.workspace.removePackage<WorkspaceRemovePackageParameters, WorkspaceModel>(params);
        },
        async changeWorkspaceGroup(params: WorkspaceChangeWorkspaceGroupParameters) {
            return SpaceConnector.clientV2.identity.workspace.changeWorkspaceGroup<WorkspaceChangeWorkspaceGroupParameters, WorkspaceModel>(params);
        },
    };

    return {
        workspaceQueryKey,
        workspaceListQueryKey,
        workspaceAPI: actions,
    };
};
