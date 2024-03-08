import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RegionListParameters } from '@/schema/inventory/region/api-verbs/list';
import type { RegionModel } from '@/schema/inventory/region/model';
import { store } from '@/store';

import { RegionMap } from '@/store/modules/reference/region/config';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';


type PickedRegionModel = Pick<RegionModel, 'provider'>;
export type RegionItem = Required<Pick<ReferenceItem<PickedRegionModel>, 'key'|'label'|'name'|'continent'|'data'>>;
export type RegionReferenceMap = ReferenceMap<RegionItem>;

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
            type: MANAGED_VARIABLE_MODEL_CONFIGS.region.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.region.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.region.name,
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

