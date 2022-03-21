import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import { REFERENCE_LOAD_TTL } from '@/store/modules/resource/config';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.spotAutomation.spotGroup.list({
            query: {
                only: ['spot_group_id', 'name'],
            },
        }, { timeout: 3000 });
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
