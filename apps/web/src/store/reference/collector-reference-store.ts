import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CollectorListParameters } from '@/schema/inventory/collector/api-verbs/list';
import type { CollectorModel } from '@/schema/inventory/collector/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type CollectorItem = Required<Pick<ReferenceItem<CollectorModel>, 'key'|'label'|'name'|'icon'>>;
export type CollectorReferenceMap = ReferenceMap<CollectorItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useCollectorReferenceStore = defineStore('collector-reference', () => {
    const state = reactive({
        items: null as CollectorReferenceMap | null,
    });

    const getters = reactive({
        collectorItems: asyncComputed<CollectorReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        collectorTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.collector.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.collector.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.collector.name,
            referenceMap: getters.collectorItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: CollectorReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.inventory.collector.list<CollectorListParameters, ListResponse<CollectorModel>>({
                query: {
                    only: ['collector_id', 'name', 'tags'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((collectorInfo: any): void => {
                referenceMap[collectorInfo.collector_id] = {
                    key: collectorInfo.collector_id,
                    label: collectorInfo.name,
                    name: collectorInfo.name,
                    icon: assetUrlConverter(collectorInfo.tags.icon),
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (collectorInfo: CollectorModel) => {
        state.items = {
            ...state.items,
            [collectorInfo.collector_id]: {
                key: collectorInfo.collector_id,
                label: collectorInfo.name,
                name: collectorInfo.name,
                icon: assetUrlConverter(collectorInfo.tags.icon),
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

