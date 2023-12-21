import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupGetParameters } from '@/schema/identity/project-group/api-verbs/get';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

const getProjectGroup = async (projectGroupId?: string): Promise<ProjectGroupModel|undefined> => {
    if (!projectGroupId) return undefined;
    try {
        return await SpaceConnector.clientV2.identity.projectGroup.get<ProjectGroupGetParameters, ProjectGroupModel>({
            project_group_id: projectGroupId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
export const useProjectGroupReferenceStore = defineStore('project-group-reference', () => {
    const fetcher = getCancellableFetcher<ListResponse<ProjectGroupModel>>(SpaceConnector.clientV2.identity.projectGroup.list);
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
                only: ['project_group_id', 'name', 'parent_group_id', 'workspace_id'],
            },
        };
        try {
            const { status, response } = await fetcher(params);
            if (status === 'cancelled') return;
            const projectGroupReferenceMap: ProjectGroupReferenceMap = {};

            // eslint-disable-next-line no-restricted-syntax
            for await (const projectGroupInfo of response?.results || []) {
                const parentGroup = await getProjectGroup(projectGroupInfo.parent_group_id);
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
                    },
                };
            }

            state.items = projectGroupReferenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (projectGroupInfo: ProjectGroupModel) => {
        const parentGroup = await getProjectGroup(projectGroupInfo.parent_group_id);
        state.items = {
            ...state.items,
            [projectGroupInfo.project_group_id]: {
                key: projectGroupInfo.project_group_id,
                label: (parentGroup)
                    ? `${parentGroup.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
                name: projectGroupInfo.name,
                data: {
                    parentGroupInfo: parentGroup ? {
                        id: parentGroup.project_group_id,
                        name: parentGroup.name,
                    } : undefined,
                },
            },
        };
    };

    const getters = reactive({
        projectGroupItems: asyncComputed<ProjectGroupReferenceMap>(async () => {
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        projectGroupTypeInfo: computed<ReferenceTypeInfo>(() => ({
            ...REFERENCE_TYPE_INFO.project_group,
            referenceMap: getters.projectGroupItems,
        })),
    });

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

