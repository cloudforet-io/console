import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type {
    ReferenceItem,
    ReferenceMap,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


export interface QuerySetModel {
    query_set_id: string;
    name: string;
    provider: string;
    state: 'ENABLED' | 'DISABLED';
    query_options: Record<string, any>;
    query_type: 'LOCAL' | 'MANAGED' | 'CUSTOM';
    unit: Record<string, any>;
    keys: string[];
    additional_info_keys: string[];
    cloud_service_group: string;
    cloud_service_type: string;
    tags: Record<string, any>;
    domain_id: string;
    created_at: string;
    last_synchronized_at: string;
}

type PickedQuerySetModel = Pick<QuerySetModel, 'query_set_id'|'name'|'provider'|'cloud_service_group'|'cloud_service_type'>;
export type QuerySetItems = Required<Pick<ReferenceItem<PickedQuerySetModel>, 'key'|'label'|'name'|'data'>>;
export type CloudServiceQuerySetReferenceMap = ReferenceMap<QuerySetItems>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
const lastLoadedTime = 0;

export const useCloudServiceQuerySetReferenceStore = defineStore('cloud-service-query-set-reference-store', () => {
    const state = reactive({
        items: null as CloudServiceQuerySetReferenceMap|null,
    });

    const getters = reactive({
        cloudServiceQuerySetItems: asyncComputed<CloudServiceQuerySetReferenceMap>(async () => {
            if (state.items === null) await actions.load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        cloudServiceQuerySetTypeInfo: computed<ReferenceTypeInfo>(() => ({
            ...REFERENCE_TYPE_INFO.cloud_service_query_set,
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


            const fetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.cloudServiceQuerySet.list);
            try {
                const { status, response } = await fetcher({
                    query: {
                        only: ['query_set_id', 'name'],
                    },
                });
                if (status === 'succeed') {
                    const items: CloudServiceQuerySetReferenceMap = {};
                    response.results.forEach((item: QuerySetModel) => {
                        items[item.query_set_id] = {
                            key: item.query_set_id,
                            label: item.name,
                            name: item.name,
                            data: item,
                        };
                    });
                    state.items = items;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };

    return {
        getters,
        ...actions,
    };
});
