import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceQuerySetListParameters } from '@/schema/inventory/cloud-service-query-set/api-verbs/list';
import type { CloudServiceQuerySetModel } from '@/schema/inventory/cloud-service-query-set/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


type PickedQuerySetModel = Pick<CloudServiceQuerySetModel, 'query_set_id'|'name'|'provider'|'cloud_service_group'|'cloud_service_type'>;
export type QuerySetItems = Required<Pick<ReferenceItem<PickedQuerySetModel>, 'key'|'label'|'name'|'data'>>;
export type CloudServiceQuerySetReferenceMap = ReferenceMap<QuerySetItems>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useCloudServiceQuerySetReferenceStore = defineStore('cloud-service-query-set-reference-store', () => {
    const state = reactive({
        items: null as CloudServiceQuerySetReferenceMap|null,
    });

    const getters = reactive({
        cloudServiceQuerySetItems: asyncComputed<CloudServiceQuerySetReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await actions.load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        cloudServiceQuerySetTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.cloud_service_query_set.prototype.meta.key,
            key: MANAGED_VARIABLE_MODELS.cloud_service_query_set.prototype.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.cloud_service_query_set.prototype.meta.name,
            referenceMap: getters.cloudServiceQuerySetItems,
        })),
    });

    const actions = {
        async load(options?: ReferenceLoadOptions) {
            const currentTime = new Date().getTime();

            if (
                ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                    || (options?.lazyLoad && state.items)
                ) && !options?.force
            ) return;


            try {
                const res = await SpaceConnector.clientV2.inventory.cloudServiceQuerySet.list<CloudServiceQuerySetListParameters, ListResponse<CloudServiceQuerySetModel>>({
                    query: {
                        only: ['query_set_id', 'name'],
                    },
                });
                const items: CloudServiceQuerySetReferenceMap = {};
                res.results?.forEach((item: CloudServiceQuerySetModel) => {
                    items[item.query_set_id] = {
                        key: item.query_set_id,
                        label: item.name,
                        name: item.name,
                        data: item,
                    };
                });
                state.items = items;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                lastLoadedTime = currentTime;
            }
        },
        flush() {
            state.items = null;
            lastLoadedTime = 0;
        },
    };

    return {
        getters,
        ...actions,
    };
});
