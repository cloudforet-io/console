import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

interface UserWorkspaceStoreState {
    items: WorkspaceModel[];
    currentWorkspaceId?: string;
}

// NOTICE: If the user page is added, be sure to add it to the USER_PAGE_FIRST_PATH_LIST constant.
export const useUserWorkspaceStore = defineStore('user-workspace-store', () => {
    const state = reactive<UserWorkspaceStoreState>({
        items: [],
        currentWorkspaceId: '',
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
            const found = state.items.find((workspace) => workspace.workspace_id === state.currentWorkspaceId);
            let currentItem: WorkspaceModel|undefined;
            if (found) {
                currentItem = found;
            } else {
                currentItem = undefined;
            }
            return currentItem;
        }),
        currentWorkspaceId: computed<string|undefined>(() => state.currentWorkspaceId),
    });

    const mutations = {
        setCurrentWorkspace(workspaceId?: string) {
            state.currentWorkspaceId = workspaceId;
        },
    };

    const actions = {
        async load() {
            try {
                const { results } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<undefined, ListResponse<WorkspaceModel>>();
                state.items = results?.filter((workspace) => workspace.state === 'ENABLED') || [];
            } catch (e) {
                console.error(e);
                actions.reset();
            }
        },
        getIsAccessibleWorkspace(workspaceId: string) {
            if (!workspaceId) return false;
            return state.items.some((workspace) => workspace.workspace_id === workspaceId);
        },
        reset() {
            state.items = [];
            state.currentWorkspaceId = undefined;
        },
    };

    return {
        getters,
        ...mutations,
        ...actions,
    };
});
