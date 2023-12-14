import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { GetWorkspacesParameters } from '@/schema/identity/user/api-verbs/get-workspaces';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

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
        async load(userId?: string) {
            // TODO: remove this
            const domainId = store.state.domain.domainId;
            if (!userId) {
                state.items = [];
                return;
            }
            const { results } = await SpaceConnector.clientV2.identity.user.getWorkspaces<GetWorkspacesParameters, ListResponse<WorkspaceModel>>({
                user_id: userId,
                domain_id: domainId,
            });
            state.items = results || [];
        },
        setCurrentWorkspace(workspaceId?: string) {
            const found = state.items.find((workspace) => workspace.workspace_id === workspaceId);
            let currentItem: WorkspaceModel|undefined;
            if (found) {
                currentItem = found;
            } else if (state.items.length) {
                currentItem = state.items[0];
            } else {
                currentItem = undefined;
            }

            if (currentItem) {
                setDefaultParamsToSpaceConnector(currentItem.workspace_id);
            }
            state.currentItem = currentItem;
        },
    };

    return {
        getters,
        ...actions,
    };
});

// TODO: remove this after identity v2 is ready
const EXCLUDED_DOMAIN_ID_API_LIST = [
    '/identity/domain/get-auth-info',
    '/identity/endpoint/list',
];

const setDefaultParamsToSpaceConnector = (workspaceId: string) => {
    SpaceConnector.setRequestInterceptor((request) => {
        if (!request.url) return request;

        // TODO: remove this after identity v2 is ready
        if (request.data && !EXCLUDED_DOMAIN_ID_API_LIST.includes(request.url)) {
            request.data = {
                domain_id: store.state.domain.domainId,
                ...request.data,
            };
        }

        if (excludedWorkspaceApiMap.has(request.url)) {
            return request;
        }

        if (request.data) {
            request.data = {
                workspace_id: workspaceId,
                ...request.data,
            };
        }
        return request;
    });
};

const EXCLUDED_WORKSPACE_API_LIST = [
    // identity
    '/identity/token/issue',
    '/identity/user/get',
    '/identity/user/get-workspaces',
    '/identity/user/find',
    '/identity/role/list',
    '/identity/role/get',
    '/identity/app/list',
    '/identity/app/create',
    '/identity/app/update',
    '/identity/app/generate-api-key',
    '/identity/app/enable',
    '/identity/app/disable',
    '/identity/app/delete',
    '/identity/app/get',
    '/identity/api-key/create',
    '/identity/api-key/update',
    '/identity/api-key/enable',
    '/identity/api-key/disable',
    '/identity/api-key/delete',
    '/identity/api-key/get',
    '/identity/api-key/list',
    '/identity/api-key/stat',
    '/identity/endpoint/list',
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
