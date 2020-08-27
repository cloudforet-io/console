import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.project.list({
        query: {
            only: ['project_id', 'name', 'project_group_info'],
        },
    });
    const projects: ResourceMap = {};

    response.results.forEach((projectInfo: any): void => {
        projects[projectInfo.project_id] = {
            label: `${projectInfo.name} > ${projectInfo.project_group_info.name}`,
        };
    });

    commit('setProjects', projects);
};
