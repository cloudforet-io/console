import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';


type PickedWorkspaceModel = Pick<WorkspaceModel, 'state' | 'tags'|'cost_info'|'service_account_count' |'created_at'|'user_count'|'packages'>;
export type WorkspaceItem = Required<Pick<ReferenceItem<PickedWorkspaceModel>, 'key'|'label'|'name'|'data'>>;
export type WorkspaceReferenceMap = ReferenceMap<WorkspaceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useWorkspaceReferenceStore = defineStore('reference-workspace', () => {
    const appContextStore = useAppContextStore();
    const authorizationStore = useAuthorizationStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        items: null as WorkspaceReferenceMap | null,
    });

    const getters = reactive({
        workspaceItems: asyncComputed<WorkspaceReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        workspaceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.workspace.meta.key,
            key: MANAGED_VARIABLE_MODELS.workspace.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.workspace.meta.name,
            referenceMap: getters.workspaceItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: WorkspaceListParameters = {
            query: {
                only: ['name', 'workspace_id', 'state', 'tags', 'cost_info', 'service_account_count', 'created_at', 'user_count', 'packages'],
            },
        };

        let results: WorkspaceModel[] | undefined;
        if (_state.isAdminMode) {
            const res = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>(params);
            results = res.results;
        } else {
            const res = await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<undefined, ListResponse<WorkspaceModel>>();
            results = res.results;
        }

        const workspaceReferenceMap: WorkspaceReferenceMap = {};

        results?.forEach((workspace) => {
            workspaceReferenceMap[workspace.workspace_id] = {
                key: workspace.workspace_id,
                label: workspace.name,
                name: workspace.name,
                data: {
                    state: workspace.state,
                    tags: workspace.tags,
                    cost_info: workspace.cost_info,
                    service_account_count: workspace.service_account_count,
                    created_at: workspace.created_at,
                    user_count: workspace.user_count,
                    packages: workspace.packages,
                },
            };
        });

        state.items = workspaceReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (workspace: WorkspaceModel) => {
        state.items = {
            ...state.items,
            [workspace.workspace_id]: {
                key: workspace.workspace_id,
                label: workspace.name,
                name: workspace.name,
                data: {
                    state: workspace.state,
                    tags: workspace.tags,
                    cost_info: workspace.cost_info,
                    service_account_count: workspace.service_account_count,
                    created_at: workspace.created_at,
                    user_count: workspace.user_count,
                    packages: workspace.packages,
                },
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

