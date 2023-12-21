import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupGetParameters } from '@/schema/identity/project-group/api-verbs/get';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';

import type { ReferenceLoadOptions, ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';



interface ProjectResourceItemData {
    groupInfo?: {
        id: string;
        name: string;
    };
}
export type ProjectReferenceItem = Required<Pick<ReferenceItem<ProjectResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type ProjectReferenceMap = ReferenceMap<ProjectReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useProjectReferenceStore = defineStore('project-reference', () => {
    const fetcher = getCancellableFetcher<ListResponse<ProjectModel>>(SpaceConnector.clientV2.identity.project.list);
    const state = reactive({
        items: null as ProjectReferenceMap | null,
    });

    const getters = reactive({
        projectItems: asyncComputed<ProjectReferenceMap>(async () => {
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        projectTypeInfo: computed<ReferenceTypeInfo>(() => ({
            ...REFERENCE_TYPE_INFO.project,
            referenceMap: getters.projectItems,
        })),
    });

    const _getProjectGroup = async (projectGroupId?: string): Promise<ProjectGroupModel|undefined> => {
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
    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: ProjectListParameters = {
            query: {
                only: ['project_id', 'name', 'project_group_id', 'workspace_id'],
            },
        };
        const { status, response } = await fetcher(params);
        if (status === 'cancelled') return;

        const projectReferenceMap: ProjectReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        for await (const projectInfo of response?.results || []) {
            const projectGroup = await _getProjectGroup(projectInfo.project_group_id);
            projectReferenceMap[projectInfo.project_id] = {
                key: projectInfo.project_id,
                label: (projectGroup)
                    ? `${projectGroup.name} > ${projectInfo.name}` : projectInfo.name,
                name: projectInfo.name,
                data: {
                    groupInfo: (projectGroup) ? {
                        id: projectGroup.project_group_id,
                        name: projectGroup.name,
                    } : undefined,
                },
            };
        }

        state.items = projectReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (project: ProjectModel) => {
        const projectGroup = await _getProjectGroup(project.project_group_id);
        state.items = {
            ...state.items,
            [project.project_id]: {
                key: project.project_id,
                label: (projectGroup)
                    ? `${projectGroup.name} > ${project.name}` : project.name,
                name: project.name,
                data: {
                    groupInfo: (projectGroup) ? {
                        id: projectGroup.project_group_id,
                        name: projectGroup.name,
                    } : undefined,
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

