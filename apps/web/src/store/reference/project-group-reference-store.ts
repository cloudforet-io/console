import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGroupListParameters } from '@/api-clients/identity/project-group/schema/api-verbs/list';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface ProjectGroupResourceItemData {
    parentGroupInfo?: {
        id: string;
        name: string;
    };
    users?: string[];
}
export type ProjectGroupReferenceItem = Required<Pick<ReferenceItem<ProjectGroupResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type ProjectGroupReferenceMap = ReferenceMap<ProjectGroupReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;


export const useProjectGroupReferenceStore = defineStore('reference-project-group', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        items: null as ProjectGroupReferenceMap | null,
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: ProjectGroupListParameters = {
            query: {
                only: ['project_group_id', 'name', 'parent_group_id', 'workspace_id', 'users'],
            },
        };
        try {
            const res = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>(params);

            const projectGroupReferenceMap: ProjectGroupReferenceMap = {};

            res?.results?.forEach((projectGroupInfo) => {
                const parentGroup = res.results?.find((d) => d.project_group_id === projectGroupInfo.parent_group_id);
                projectGroupReferenceMap[projectGroupInfo.project_group_id] = {
                    key: projectGroupInfo.project_group_id,
                    label: (parentGroup)
                        ? `${parentGroup.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
                    name: projectGroupInfo.name,
                    data: {
                        parentGroupInfo: parentGroup ? {
                            id: parentGroup.project_group_id,
                            name: parentGroup.name,
                        } : undefined,
                        users: projectGroupInfo.users,
                    },
                };
            });

            state.items = projectGroupReferenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (projectGroupInfo: ProjectGroupModel) => {
        const parentGroup = state.items?.[projectGroupInfo.parent_group_id];
        state.items = {
            ...state.items,
            [projectGroupInfo.project_group_id]: {
                key: projectGroupInfo.project_group_id,
                label: (parentGroup)
                    ? `${parentGroup.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
                name: projectGroupInfo.name,
                data: {
                    parentGroupInfo: parentGroup ? {
                        id: parentGroup.key,
                        name: parentGroup.name,
                    } : undefined,
                    users: projectGroupInfo.users,
                },
            },
        };
    };

    const getters = reactive({
        projectGroupItems: asyncComputed<ProjectGroupReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        projectGroupTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.project_group.meta.key,
            key: MANAGED_VARIABLE_MODELS.project_group.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.project_group.meta.name,
            referenceMap: getters.projectGroupItems,
        })),
    });

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

