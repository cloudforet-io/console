import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ReferenceMap, ReferenceState } from '@/store/modules/reference/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';
import { RegionMap } from '@/services/cost-explorer/widgets/lib/config';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.inventory.region.list({
            query: {
                only: ['name', 'region_code', 'tags', 'provider'],
            },
        }, { timeout: 3000 });
        const regions: ReferenceMap = {};

        response.results.forEach((regionInfo: any): void => {
            regions[regionInfo.region_code] = {
                label: `${regionInfo.name} | ${regionInfo.region_code}`,
                name: regionInfo.name,
                continent: RegionMap[regionInfo.tags.continent] || {},
            };
        });

        commit('setRegions', regions);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ReferenceState, any> = ({ state, commit }, regionInfo): void => {
    const regions = {
        ...state.items,
        [regionInfo.region_code]: {
            label: `${regionInfo.name} | ${regionInfo.region_code}`,
            name: regionInfo.name,
            continent: RegionMap[regionInfo.tags.continent] || {},
        },
    };
    commit('setRegions', regions);
};
