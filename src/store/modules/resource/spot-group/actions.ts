import { SpaceConnector } from '@/core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.spotAutomation.spotGroup.list({
            query: {
                only: ['spot_group_id', 'name'],
            },
        }, { timeout: 2000 });
        const spotGroups: ResourceMap = {};

        response.results.forEach((spotGroupInfo: any): void => {
            spotGroups[spotGroupInfo.spot_group_id] = {
                label: spotGroupInfo.name,
                name: spotGroupInfo.name,
            };
        });

        commit('setSpotGroups', spotGroups);
    } catch (e) {}
};
