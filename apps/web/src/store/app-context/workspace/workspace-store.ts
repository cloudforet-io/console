import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/model';
import type { WorkspaceListRequestParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

interface WorkspaceStoreState {
    items: WorkspaceModel[];
    currentItem?: WorkspaceModel;
}

export const useWorkspaceStore = defineStore('workspace-store', () => {
    const state = reactive<WorkspaceStoreState>({
        items: [],
        currentItem: undefined,
    });

    const getters = reactive({
        workspaceList: computed<WorkspaceModel[]>(() => state.items || []),
        currentWorkspace: computed<WorkspaceModel|undefined>(() => state.currentItem),
        currentWorkspaceId: computed<string|undefined>(() => state.currentItem?.workspace_id),
    });

    const actions = {
        async load() {
            const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListRequestParameters, ListResponse<WorkspaceModel>>();
            state.items = results || [];
        },
        setCurrentWorkspace(workspaceId?: string) {
            state.currentItem = state.items.find((workspace) => workspace.workspace_id === workspaceId);
            // TDOO: set current workspace id to api client
        },
    };

    return {
        getters,
        ...actions,
    };
});
