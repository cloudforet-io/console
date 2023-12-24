import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

// eslint-disable-next-line import/no-cycle
import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { ReferenceLoadOptions, ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';


type PickedWorkspaceModel = Pick<WorkspaceModel, 'state'>;
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
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        workspaceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            ...REFERENCE_TYPE_INFO.workspace,
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
                only: ['name', 'workspace_id', 'state'],
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
                },
            },
        };
    };

    const actions = {
        load,
        sync,
        flush: () => { state.items = null; },
    };

    return {
        state,
        getters,
        ...actions,
    };
});

