import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.projectGroup.list({
        query: {
            only: ['project_group_id', 'name', 'parent_project_group_info'],
        },
    });
    const projectGroups: ResourceMap = {};

    response.results.forEach((projectGroupInfo: any): void => {
        projectGroups[projectGroupInfo.project_group_id] = {
            label: (projectGroupInfo.parent_project_group_info)
                ? `${projectGroupInfo.parent_project_group_info.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
            name: projectGroupInfo.name,
        };
    });

    commit('setProjectGroups', projectGroups);
};
