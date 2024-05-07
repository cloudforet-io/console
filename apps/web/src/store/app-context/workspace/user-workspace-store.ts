import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

interface UserWorkspaceStoreState {
    items: WorkspaceModel[];
    currentItem?: string;
}

export const useUserWorkspaceStore = defineStore('user-workspace-store', () => {
    const state = reactive<UserWorkspaceStoreState>({
        items: [],
        currentItem: '',
    });

    const getters = reactive({
        workspaceList: computed<WorkspaceModel[]>(() => state.items || []),
        workspaceMap: computed(() => {
            const map = {};
            getters.workspaceList.forEach((workspace) => {
                map[workspace.workspace_id] = workspace;
            });
            return map;
        }),
        currentWorkspace: computed<WorkspaceModel|undefined>(() => {
            const found = state.items.find((workspace) => workspace.workspace_id === state.currentItem);
            let currentItem: WorkspaceModel|undefined;
            if (found) {
                currentItem = found;
            } else {
                currentItem = undefined;
            }
            return currentItem;
        }),
        currentWorkspaceId: computed<string|undefined>(() => state.currentItem),
    });

    const mutations = {
        setCurrentWorkspace(workspaceId?: string) {
            state.currentItem = workspaceId;
        },
    };

    const actions = {
        async load() {
            const { results } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<undefined, ListResponse<WorkspaceModel>>();
            state.items = results?.filter((workspace) => workspace.state === 'ENABLED') || [];
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
        ...mutations,
        ...actions,
    };
});
