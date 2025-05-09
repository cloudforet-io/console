import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceGroupListParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/list';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

type PickedWorkspaceGroupModel = Pick<WorkspaceGroupModel, 'tags'>;
export type WorkspaceGroupItem = Required<Pick<ReferenceItem<PickedWorkspaceGroupModel>, 'key'|'label'|'name'|'data'>>;
export type WorkspaceGroupReferenceMap = ReferenceMap<WorkspaceGroupItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useWorkspaceGroupReferenceStore = defineStore('reference-workspace-group', () => {
    const appContextStore = useAppContextStore();
    const authorizationStore = useAuthorizationStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        items: null as WorkspaceGroupReferenceMap | null,
    });

    const getters = reactive({
        workspaceGroupItems: asyncComputed<WorkspaceGroupReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        workspaceGroupTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.workspace_group.meta.key,
            key: MANAGED_VARIABLE_MODELS.workspace_group.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.workspace_group.meta.name,
            referenceMap: getters.workspaceGroupItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: WorkspaceGroupListParameters = {
            query: {
                only: ['name', 'workspace_group_id', 'tags'],
            },
        };

        let results: WorkspaceGroupModel[] | undefined;
        try {
            if (_state.isAdminMode) {
                const res = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>(params);
                results = res.results;
            } else {
                const res = await SpaceConnector.clientV2.identity.userProfile.getWorkspaceGroups();
                results = res.results;
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }
        const workspaceGroupReferenceMap: WorkspaceGroupReferenceMap = {};

        results?.forEach((workspaceGroup) => {
            workspaceGroupReferenceMap[workspaceGroup.workspace_group_id] = {
                key: workspaceGroup.workspace_group_id,
                label: workspaceGroup.name,
                name: workspaceGroup.name,
                data: {
                    tags: workspaceGroup.tags,
                },
            };
        });

        state.items = workspaceGroupReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (workspaceGroup: WorkspaceGroupModel) => {
        state.items = {
            ...state.items,
            [workspaceGroup.workspace_group_id]: {
                key: workspaceGroup.workspace_group_id,
                label: workspaceGroup.name,
                name: workspaceGroup.name,
                data: {
                    tags: workspaceGroup.tags,
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

