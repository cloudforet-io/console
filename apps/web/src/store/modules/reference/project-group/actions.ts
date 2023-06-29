import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Action } from 'vuex';


import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ProjectGroupReferenceMap, ProjectGroupReferenceState } from '@/store/modules/reference/project-group/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<ProjectGroupReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        || (options?.lazyLoad && state.items)
        ) && !options?.force
    ) return;

    try {
        const response = await SpaceConnector.client.identity.projectGroup.list({
            query: {
                only: ['project_group_id', 'name', 'parent_project_group_info'],
            },
        }, { timeout: 3000 });
        const projectGroups: ProjectGroupReferenceMap = {};

        response.results.forEach((projectGroupInfo: any): void => {
            const parentGroup = projectGroupInfo.parent_project_group_info;
            projectGroups[projectGroupInfo.project_group_id] = {
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
        });

        commit('setProjectGroups', projectGroups);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProjectGroupReferenceState, any> = ({ state, commit }, projectGroupInfo): void => {
    const parentGroup = projectGroupInfo.parent_project_group_info;
    const projectGroups: ProjectGroupReferenceMap = {
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
    commit('setProjectGroups', projectGroups);
};
