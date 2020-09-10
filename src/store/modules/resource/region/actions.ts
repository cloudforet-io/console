import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.inventory.region.list({
        query: {
            only: ['name', 'region_code'],
            distinct: 'region_code',
        },
    });
    const regions: ResourceMap = {};

    response.results.forEach((regionInfo: any): void => {
        regions[regionInfo.region_code] = {
            label: `${regionInfo.name} | ${regionInfo.region_code}`,
        };
    });

    commit('setRegions', regions);
};
