import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

interface UserWorkspaceStoreState {
    items: WorkspaceModel[];
    currentItem?: WorkspaceModel;
}

export const useUserWorkspaceStore = defineStore('user-workspace-store', () => {
    const state = reactive<UserWorkspaceStoreState>({
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
            const { results } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<undefined, ListResponse<WorkspaceModel>>();
            state.items = results?.filter((workspace) => workspace.state === 'ENABLED') || [];
        },
        setCurrentWorkspace(workspaceId?: string) {
            const found = state.items.find((workspace) => workspace.workspace_id === workspaceId);
            let currentItem: WorkspaceModel|undefined;
            if (found) {
                currentItem = found;
            } else {
                currentItem = undefined;
            }

            state.currentItem = currentItem;
        },
        getIsAccessibleWorkspace(workspaceId: string) {
            if (!workspaceId) return false;
            return state.items.some((workspace) => workspace.workspace_id === workspaceId);
        },
        reset() {
            state.items = [];
            state.currentItem = undefined;
        },
    };

    return {
        getters,
        ...actions,
    };
});
