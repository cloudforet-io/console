import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.inventory.region.list({
            query: {
                only: ['name', 'region_code'],
            },
        }, { timeout: 2000 });
        const regions: ResourceMap = {};

        response.results.forEach((regionInfo: any): void => {
            regions[regionInfo.region_code] = {
                label: `${regionInfo.name} | ${regionInfo.region_code}`,
                name: regionInfo.name,
            };
        });

        commit('setRegions', regions);
    } catch (e) {}
};
