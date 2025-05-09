import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CollectorListParameters } from '@/schema/inventory/collector/api-verbs/list';
import type { CollectorModel } from '@/schema/inventory/collector/model';

import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useAuthorizationStore } from '../authorization/authorization-store';


export type CollectorItem = Required<Pick<ReferenceItem<CollectorModel>, 'key'|'label'|'name'|'icon'>>;
export type CollectorReferenceMap = ReferenceMap<CollectorItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useCollectorReferenceStore = defineStore('reference-collector', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        items: null as CollectorReferenceMap | null,
    });

    const getters = reactive({
        collectorItems: asyncComputed<CollectorReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        collectorTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.collector.meta.key,
            key: MANAGED_VARIABLE_MODELS.collector.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.collector.meta.name,
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
            const collectorFetcher = SpaceConnector.clientV2.inventory.collector.list;

            const response = await collectorFetcher<CollectorListParameters, ListResponse<CollectorModel>>({
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

