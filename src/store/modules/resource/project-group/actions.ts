import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ProjectGroupResourceMap } from '@/store/modules/resource/project-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.projectGroup.list({
            query: {
                only: ['project_group_id', 'name', 'parent_project_group_info'],
            },
        }, { timeout: 2000 });
        const projectGroups: ProjectGroupResourceMap = {};

        response.results.forEach((projectGroupInfo: any): void => {
            const parentGroup = projectGroupInfo.parent_project_group_info;
            projectGroups[projectGroupInfo.project_group_id] = {
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
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
