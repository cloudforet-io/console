import { asyncComputed } from '@vueuse/core';
import { reactive } from 'vue';

import { camelCase } from 'lodash';
import { defineStore } from 'pinia';

import { store } from '@/store';

import type {
    VuexStoreAllReferenceTypeInfo,
    ReferenceMap,
    VuexStoreReferenceType,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';

import type { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';


export type ReferenceType = VuexStoreReferenceType|'costDataSource'|'cost_data_source';

export interface ReferenceTypeInfo {
    type: ReferenceType;
    key: string; // project_id
    name: string; // Project
    referenceMap: ReferenceMap;
}
export interface AllReferenceTypeInfo extends VuexStoreAllReferenceTypeInfo {
    [REFERENCE_TYPE_INFO.cost_data_source.type]: ReferenceTypeInfo;
}

export const useAllReferenceStore = defineStore('all-reference-store', () => {
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();

    const getters = reactive({
        allReferenceTypeInfo: asyncComputed(async () => {
            await actions.loadAll();
            return {
                ...store.getters['reference/allReferenceTypeInfo'],
                costDataSource: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
                cost_data_source: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
            };
        }),
        projectGroup: asyncComputed(async () => {
            await store.dispatch('reference/projectGroup/load');
            return store.getters['reference/projectGroupItems'];
        }),
        project_group: asyncComputed(async () => {
            await store.dispatch('reference/project_group/load');
            return store.getters['reference/projectGroupItems'];
        }),
        project: asyncComputed(async () => {
            await store.dispatch('reference/project/load');
            return store.getters['reference/projectItems'];
        }),
        protocol: asyncComputed(async () => {
            await store.dispatch('reference/protocol/load');
            return store.getters['reference/protocolItems'];
        }),
        cloudServiceType: asyncComputed(async () => {
            await store.dispatch('reference/cloudServiceType/load');
            return store.getters['reference/cloudServiceTypeItems'];
        }),
        cloud_service_type: asyncComputed(async () => {
            await store.dispatch('reference/cloud_service_type/load');
            return store.getters['reference/cloudServiceTypeItems'];
        }),
        collector: asyncComputed(async () => {
            await store.dispatch('reference/collector/load');
            return store.getters['reference/collectorItems'];
        }),
        plugin: asyncComputed(async () => {
            await store.dispatch('reference/plugin/load');
            return store.getters['reference/pluginItems'];
        }),
        provider: asyncComputed(async () => {
            await store.dispatch('reference/provider/load');
            return store.getters['reference/providerItems'];
        }),
        region: asyncComputed(async () => {
            await store.dispatch('reference/region/load');
            return store.getters['reference/regionItems'];
        }),
        secret: asyncComputed(async () => {
            await store.dispatch('reference/secret/load');
            return store.getters['reference/secretItems'];
        }),
        serviceAccount: asyncComputed(async () => {
            await store.dispatch('reference/serviceAccount/load');
            return store.getters['reference/serviceAccountItems'];
        }),
        service_account: asyncComputed(async () => {
            await store.dispatch('reference/service_account/load');
            return store.getters['reference/serviceAccountItems'];
        }),
        user: asyncComputed(async () => {
            await store.dispatch('reference/user/load');
            return store.getters['reference/userItems'];
        }),
        webHook: asyncComputed(async () => {
            await store.dispatch('reference/webHook/load');
            return store.getters['reference/webHookItems'];
        }),
    });

    const actions = {
        async loadAll(options?: ReferenceLoadOptions) {
            await Promise.allSettled([
                store.dispatch('reference/loadAll', options),
                costDataSourceReferenceStore.load(options),
            ]);
        },
        async load(type: ReferenceType, options?: ReferenceLoadOptions) {
            if (type === 'costDataSource' || type === 'cost_data_source') {
                await costDataSourceReferenceStore.load(options);
            } else {
                await store.dispatch(`reference/${camelCase(type)}/load`, options);
            }
        },
    };

    return {
        getters,
        ...actions,
    };
});
