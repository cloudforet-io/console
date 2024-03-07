import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';


type PickedWorkspaceModel = Pick<WorkspaceModel, 'state' | 'tags'>;
export type WorkspaceItem = Required<Pick<ReferenceItem<PickedWorkspaceModel>, 'key'|'label'|'name'|'data'>>;
export type WorkspaceReferenceMap = ReferenceMap<WorkspaceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useWorkspaceReferenceStore = defineStore('workspace-reference', () => {
    const appContextStore = useAppContextStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        items: null as WorkspaceReferenceMap | null,
    });

    const getters = reactive({
        workspaceItems: asyncComputed<WorkspaceReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        workspaceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.name,
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
                only: ['name', 'workspace_id', 'state', 'tags'],
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

