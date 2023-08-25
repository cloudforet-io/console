import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { RegionMap } from '@/store/modules/reference/region/config';
import type { RegionReferenceMap, RegionReferenceState } from '@/store/modules/reference/region/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<RegionReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;

    try {
        const response = await SpaceConnector.client.inventory.region.list({
            query: {
                only: ['name', 'region_code', 'tags', 'provider'],
            },
        }, { timeout: 3000 });
        const regions: RegionReferenceMap = {};

        response.results.forEach((regionInfo: any): void => {
            const regionKey = regionInfo.region_code === 'global' ? `${regionInfo.region_code}-${regionInfo.provider}` : regionInfo.region_code;
            regions[regionKey] = {
                key: regionKey,
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
        lastLoadedTime = currentTime;
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
