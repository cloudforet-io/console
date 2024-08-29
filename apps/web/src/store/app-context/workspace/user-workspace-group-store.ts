import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UserWorkspaceGroupStoreState {
    items: WorkspaceGroupModel[];
}

export const useUserWorkspaceGroupStore = defineStore('user-workspace-group-store', () => {
    const state = reactive<UserWorkspaceGroupStoreState>({
        items: [],
    });

    const getters = reactive({
        workspaceGroupList: computed<WorkspaceGroupModel[]>(() => state.items || []),
        workspaceGroupMap: computed(() => {
            const map = {};
            getters.workspaceGroupList.forEach((workspaceGroup) => {
                map[workspaceGroup.workspace_group_id] = workspaceGroup;
            });
            return map;
        }),
    });

    const actions = {
        async load() {
            try {
                const { results } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaceGroups();
                state.items = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        reset() {
            state.items = [];
        },
    };

    return {
        getters,
        ...actions,
    };
});
