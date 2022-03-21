import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ProjectResourceMap } from '@/store/modules/resource/project/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/resource/config';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        || (lazyLoad && Object.keys(state.items).length > 0)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.identity.project.list({
            query: {
                only: ['project_id', 'name', 'project_group_info'],
            },
        }, { timeout: 3000 });
        const projects: ProjectResourceMap = {};

        response.results.forEach((projectInfo: any): void => {
            const groupInfo = projectInfo.project_group_info;
            projects[projectInfo.project_id] = {
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
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
