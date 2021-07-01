import { SpaceConnector } from '@/core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.projectGroup.list({
            query: {
                only: ['project_group_id', 'name', 'parent_project_group_info'],
            },
        }, { timeout: 2000 });
        const projectGroups: ResourceMap = {};

        response.results.forEach((projectGroupInfo: any): void => {
            projectGroups[projectGroupInfo.project_group_id] = {
                label: (projectGroupInfo.parent_project_group_info)
                    ? `${projectGroupInfo.parent_project_group_info.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
                name: projectGroupInfo.name,
            };
        });

        commit('setProjectGroups', projectGroups);
    } catch (e) {}
};
