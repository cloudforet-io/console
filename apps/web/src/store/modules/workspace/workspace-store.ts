import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import ErrorHandler from '@/common/composables/error/errorHandler';





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
        workspaceList: asyncComputed<WorkspaceModel[]>(async () => {
            await actions.load();
            return state.items;
        }),
        currentWorkspace: computed<WorkspaceModel|undefined>(() => state.currentItem),
    });

    const actions = {
        async load() {
            try {
                const { results } = await SpaceConnector.clientV2.inventory.workspace.list({});
                state.items = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        setCurrentWorkspace(workspaceId: string) {
            state.currentItem = state.items.find((workspace) => workspace.workspace_id === workspaceId);
        },
    };

    return {
        getters,
        ...actions,
    };
});
