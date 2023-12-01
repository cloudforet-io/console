import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/model';
import type { ProjectGroupGetParameters } from '@/schema/identity/project-group/api-verbs/get';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ProjectReferenceMap, ProjectReferenceState } from '@/store/modules/reference/project/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


let lastLoadedTime = 0;

const getProjectGroup = async (projectGroupId?: string): Promise<ProjectGroupModel|undefined> => {
    if (!projectGroupId) return undefined;
    try {
        const params: ProjectGroupGetParameters = {
            project_group_id: projectGroupId,
        };
        return await SpaceConnector.clientV2.identity.projectGroup.get(params);
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
export const load: Action<ProjectReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        || (options?.lazyLoad && state.items)
        ) && !options?.force
    ) return;

    try {
        const params: ProjectListParameters = {
            query: {
                only: ['project_id', 'name', 'project_group_id', 'workspace_id'],
            },
        };
        const { results }: ListResponse<ProjectModel> = await SpaceConnector.clientV2.identity.project.list(params, { timeout: 3000 });
        const projects: ProjectReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        for await (const projectInfo of results || []) {
            const projectGroup = await getProjectGroup(projectInfo.project_group_id);
            projects[projectInfo.project_id] = {
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

        commit('setProjects', projects);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProjectReferenceState, any> = async ({ state, commit }, projectInfo): Promise<void> => {
    const projectGroup = await getProjectGroup(projectInfo.project_group_id);
    const projects: ProjectReferenceMap = {
        ...state.items,
        [projectInfo.project_id]: {
            key: projectInfo.project_id,
            label: (projectGroup)
                ? `${projectGroup.name} > ${projectInfo.name}` : projectInfo.name,
            name: projectInfo.name,
            icon: {
                groupInfo: (projectGroup) ? {
                    id: projectGroup.project_group_id,
                    name: projectGroup.name,
                } : undefined,
            },
        },
    };
    commit('setProjects', projects);
};
