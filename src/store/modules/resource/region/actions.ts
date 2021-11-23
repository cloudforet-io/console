import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

const regionMap = {
    africa: {
        continent_label: 'Africa',
        longitude: 21.621094,
        latitude: 11.081385,
    },
    europe: {
        continent_label: 'Europe',
        longitude: 19.160156,
        latitude: 50.896104,
    },
    north_america: {
        continent_label: 'North America',
        longitude: 39.563353,
        latitude: -99.316406,
    },
    south_america: {
        continent_label: 'South America',
        longitude: -69.6417454,
        latitude: -13.6631791,
    },
    asia_pacific: {
        continent_label: 'Asia Pacific',
        longitude: 103.183594,
        latitude: 47.212106,
    },
    middle_east: {
        continent_label: 'Middle East',
        longitude: 26.3842897,
        latitude: 26.8448363,
    },
};

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.inventory.region.list({
            query: {
                only: ['name', 'region_code', 'tags'],
            },
        }, { timeout: 2000 });
        const regions: ResourceMap = {};

        response.results.forEach((regionInfo: any): void => {
            regions[regionInfo.region_code] = {
                label: `${regionInfo.name} | ${regionInfo.region_code}`,
                name: regionInfo.name,
                continent: regionMap[regionInfo.tags.continent] || {},
            };
        });

        commit('setRegions', regions);
    } catch (e) {}
};
