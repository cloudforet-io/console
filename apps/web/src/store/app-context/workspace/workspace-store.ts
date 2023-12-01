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
            if (!workspaceId) {
                state.currentItem = undefined;
                return;
            }

            const found = state.items.find((workspace) => workspace.workspace_id === workspaceId);
            if (found) {
                state.currentItem = found;
            } else {
                state.currentItem = state.items[0];
            }

            setDefaultParamsToSpaceConnector(state.currentItem?.workspace_id);
        },
    };

    return {
        getters,
        ...actions,
    };
});


const setDefaultParamsToSpaceConnector = (workspaceId: string) => {
    SpaceConnector.setRequestInterceptor((request) => {
        if (!request.url) return request;

        if (excludedWorkspaceApiMap.has(request.url)) {
            return request;
        }

        if (request.data) {
            request.data = { workspace_id: workspaceId, ...request.data };
        }
        return request;
    });
};

const EXCLUDED_WORKSPACE_API_LIST = [
    // inventory
    '/inventory/cloud-service/analyze',
    '/inventory/cloud-service-query-set/list',
    '/inventory/cloud-service-stats/analyze',
    // dashboard
    '/dashboard/domain-dashboard/list',
    '/dashboard/domain-dashboard/get',
    '/dashboard/project-dashboard/list',
    '/dashboard/project-dashboard/get',
    // cost-analysis
    '/cost-analysis/data-source/list',
    '/cost-analysis/cost-query-set/list',
    '/cost-analysis/cost/analyze',
    '/cost-analysis/budget-usage/analyze',
    // board
    '/board/board/list',
    '/board/board/get',
    '/board/post/list',
    '/board/post/get',
];
const excludedWorkspaceApiMap = new Map<string, boolean>(EXCLUDED_WORKSPACE_API_LIST.map((url) => [url, true]));
