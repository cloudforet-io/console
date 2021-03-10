import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.project.list({
            query: {
                only: ['project_id', 'name', 'project_group_info'],
            },
        });
        const projects: ResourceMap = {};

        response.results.forEach((projectInfo: any): void => {
            projects[projectInfo.project_id] = {
                label: `${projectInfo.project_group_info.name} > ${projectInfo.name}`,
                name: projectInfo.name,
            };
        });

        commit('setProjects', projects);
    } catch (e) {}
};
