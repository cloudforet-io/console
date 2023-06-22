import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ProjectReferenceMap, ProjectReferenceState } from '@/store/modules/reference/project/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<ProjectReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        || (options?.lazyLoad && state.items)
        ) && !options?.force
    ) return;

    try {
        const response = await SpaceConnector.client.identity.project.list({
            query: {
                only: ['project_id', 'name', 'project_group_info'],
            },
        }, { timeout: 3000 });
        const projects: ProjectReferenceMap = {};

        response.results.forEach((projectInfo: any): void => {
            const groupInfo = projectInfo.project_group_info;
            projects[projectInfo.project_id] = {
                key: projectInfo.project_id,
                label: `${groupInfo.name} > ${projectInfo.name}`,
                name: projectInfo.name,
                data: {
                    groupInfo: {
                        id: groupInfo.project_group_id,
                        name: groupInfo.name,
                    },
                },
            };
        });

        commit('setProjects', projects);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProjectReferenceState, any> = ({ state, commit }, projectInfo): void => {
    const groupInfo = projectInfo.project_group_info;

    const projects: ProjectReferenceMap = {
        ...state.items,
        [projectInfo.project_id]: {
            key: projectInfo.project_id,
            label: `${groupInfo.name} > ${projectInfo.name}`,
            name: projectInfo.name,
            icon: {
                groupInfo: {
                    id: groupInfo.project_group_id,
                    name: groupInfo.name,
                },
            },
        },
    };
    commit('setProjects', projects);
};
