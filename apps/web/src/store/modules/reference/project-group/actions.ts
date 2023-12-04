import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/model';
import type { ProjectGroupGetParameters } from '@/schema/identity/project-group/api-verbs/get';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ProjectGroupReferenceMap, ProjectGroupReferenceState } from '@/store/modules/reference/project-group/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


let lastLoadedTime = 0;

const getProjectGroup = async (projectGroupId?: string, domainId?: string): Promise<ProjectGroupModel|undefined> => {
    if (!projectGroupId) return undefined;
    try {
        return await SpaceConnector.clientV2.identity.projectGroup.get<ProjectGroupGetParameters, ProjectGroupModel>({
            domain_id: domainId, // TODO: remove domain_id after backend is ready
            project_group_id: projectGroupId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
export const load: Action<ProjectGroupReferenceState, any> = async ({ state, commit, rootState }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        || (options?.lazyLoad && state.items)
        ) && !options?.force
    ) return;

    try {
        const response = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>({
            domain_id: rootState.domain.domainId, // TODO: remove domain_id after backend is ready
            query: {
                only: ['project_group_id', 'name', 'parent_group_id', 'workspace_id'],
            },
        }, { timeout: 3000 });
        const projectGroups: ProjectGroupReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        for await (const projectGroupInfo of response.results) {
            const parentGroup = await getProjectGroup(projectGroupInfo.parent_group_id, rootState.domain.domainId);
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
        }

        commit('setProjectGroups', projectGroups);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProjectGroupReferenceState, any> = async ({ state, commit, rootState }, projectGroupInfo: ProjectGroupModel): void => {
    const parentGroup = await getProjectGroup(projectGroupInfo.parent_group_id, rootState.domain.domainId);
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
