import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RegionListParameters } from '@/schema/inventory/region/api-verbs/list';
import type { RegionModel } from '@/schema/inventory/region/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

const CONTINENT_LABEL_MAP = {
    africa: 'Africa',
    europe: 'Europe',
    north_america: 'North America',
    south_america: 'South America',
    asia_pacific: 'Asia Pacific',
    middle_east: 'Middle East',
};

type PickedRegionModel = Pick<RegionModel, 'provider'>;
export type RegionReferenceItem = Required<Pick<ReferenceItem<PickedRegionModel>, 'key'|'label'|'name'|'continent'|'data'>>;
export type RegionReferenceMap = ReferenceMap<RegionReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useRegionReferenceStore = defineStore('reference-region', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        items: null as RegionReferenceMap | null,
    });

    const getters = reactive({
        regionItems: asyncComputed<RegionReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
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
            const regionFetcher = SpaceConnector.clientV2.inventory.region.list;

            const response = await regionFetcher<RegionListParameters, ListResponse<RegionModel>>({
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
                    continent: {
                        continent_code: regionInfo.tags?.continent,
                        continent_label: regionInfo.tags?.continent ? CONTINENT_LABEL_MAP[regionInfo.tags.continent] : '',
                        latitude: regionInfo.tags?.latitude ?? 0,
                        longitude: regionInfo.tags?.longitude ?? 0,
                    },
                    data: {
                        provider: regionInfo.provider,
                    },
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
                continent: {
                    continent_code: regionInfo.tags?.continent,
                    continent_label: regionInfo.tags?.continent ? CONTINENT_LABEL_MAP[regionInfo.tags.continent] : '',
                    latitude: regionInfo.tags?.latitude ?? 0,
                    longitude: regionInfo.tags?.longitude ?? 0,
                },
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

