import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UserWorkspaceGroupStoreState {
    loading: boolean;
    items: WorkspaceGroupModel[];
    totalCount: number;
}

export const useUserWorkspaceGroupStore = defineStore('user-workspace-group-store', () => {
    const state = reactive<UserWorkspaceGroupStoreState>({
        loading: false,
        items: [],
        totalCount: 0,
    });

    const getters = reactive({
        workspaceGroupList: computed<WorkspaceGroupModel[]>(() => state.items || []),
        workspaceGroupMap: computed<Record<string, WorkspaceGroupModel>>(() => {
            const map = {};
            getters.workspaceGroupList.forEach((workspaceGroup) => {
                map[workspaceGroup.workspace_group_id] = workspaceGroup;
            });
            return map;
        }),
    });

    const actions = {
        async load() {
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaceGroups();
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        },
        reset() {
            state.items = [];
            state.totalCount = 0;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
