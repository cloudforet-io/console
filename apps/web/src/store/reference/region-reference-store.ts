import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RegionListParameters } from '@/schema/inventory/region/api-verbs/list';
import type { RegionModel } from '@/schema/inventory/region/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


const RegionMap = {
    africa: {
        continent_code: 'africa',
        continent_label: 'Africa',
        latitude: 11.081385,
        longitude: 21.621094,
    },
    europe: {
        continent_code: 'europe',
        continent_label: 'Europe',
        latitude: 50.896104,
        longitude: 19.160156,
    },
    north_america: {
        continent_code: 'north_america',
        continent_label: 'North America',
        latitude: 39.563353,
        longitude: -99.316406,
    },
    south_america: {
        continent_code: 'south_america',
        continent_label: 'South America',
        latitude: -13.6631791,
        longitude: -69.6417454,
    },
    asia_pacific: {
        continent_code: 'asia_pacific',
        continent_label: 'Asia Pacific',
        longitude: 103.183594,
        latitude: 47.212106,
    },
    middle_east: {
        continent_code: 'middle_east',
        continent_label: 'Middle East',
        longitude: 26.3842897,
        latitude: 26.8448363,
    },
};

type PickedRegionModel = Pick<RegionModel, 'provider'>;
export type RegionReferenceItem = Required<Pick<ReferenceItem<PickedRegionModel>, 'key'|'label'|'name'|'continent'|'data'>>;
export type RegionReferenceMap = ReferenceMap<RegionReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useRegionReferenceStore = defineStore('region-reference', () => {
    const state = reactive({
        items: null as RegionReferenceMap | null,
    });

    const getters = reactive({
        regionItems: asyncComputed<RegionReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        regionTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.region.meta.key,
            key: MANAGED_VARIABLE_MODELS.region.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.region.meta.name,
            referenceMap: getters.regionItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: RegionReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.inventory.region.list<RegionListParameters, ListResponse<RegionModel>>({
                query: {
                    only: ['name', 'region_code', 'tags', 'provider'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((regionInfo: any): void => {
                const regionKey = regionInfo.region_code === 'global' ? `${regionInfo.region_code}-${regionInfo.provider}` : regionInfo.region_code;
                referenceMap[regionKey] = {
                    key: regionKey,
                    label: `${regionInfo.name} | ${regionInfo.region_code}`,
                    name: regionInfo.name,
                    continent: RegionMap[regionInfo.tags.continent] || {},
                    data: {
                        provider: regionInfo.provider,
                    },
                    // latitude: regionInfo.tags.latitude ?? 0,
                    // longitude: regionInfo.tags.longitude ?? 0,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (regionInfo: RegionModel) => {
        state.items = {
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
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

