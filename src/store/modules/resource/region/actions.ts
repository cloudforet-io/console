import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.inventory.region.list({
        query: {
            only: ['region_id', 'name', 'region_code'],
        },
    });
    const regions: ResourceMap = {};

    response.results.forEach((regionInfo: any): void => {
        regions[regionInfo.region_id] = {
            label: `${regionInfo.name} | ${regionInfo.region_code}`,
        };
    });

    commit('setRegions', regions);
};
