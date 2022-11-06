import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { RegionReferenceMap, RegionReferenceState } from '@/store/modules/reference/region/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { RegionMap } from '@/services/cost-explorer/widgets/lib/config';

let lastLoadedTime = 0;

export const load: Action<RegionReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.inventory.region.list({
            query: {
                only: ['name', 'region_code', 'tags', 'provider'],
            },
        }, { timeout: 3000 });
        const regions: RegionReferenceMap = {};

        response.results.forEach((regionInfo: any): void => {
            regions[regionInfo.region_code] = {
                key: regionInfo.region_code,
                label: `${regionInfo.name} | ${regionInfo.region_code}`,
                name: regionInfo.name,
                continent: RegionMap[regionInfo.tags.continent] || {},
                data: {
                    provider: regionInfo.provider,
                },
                latitude: regionInfo.tags.latitude ?? 0,
                longitude: regionInfo.tags.longitude ?? 0,
            };
        });

        commit('setRegions', regions);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<RegionReferenceState, any> = ({ state, commit }, regionInfo): void => {
    const regions: RegionReferenceMap = {
        ...state.items,
        [regionInfo.region_code]: {
            key: regionInfo.region_code,
            label: `${regionInfo.name} | ${regionInfo.region_code}`,
            name: regionInfo.name,
            continent: RegionMap[regionInfo.tags.continent] || {},
            data: {
                provider: regionInfo.provider,
            },
        },
    };
    commit('setRegions', regions);
};
