import { computed, reactive } from 'vue';

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
        allReferenceTypeInfo: computed(() => ({
            ...store.getters['reference/allReferenceTypeInfo'],
            costDataSource: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
            cost_data_source: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
        })),
        projectGroup: computed(() => store.getters['reference/projectGroupItems']),
        project_group: computed(() => store.getters['reference/projectGroupItems']),
        project: computed(() => store.getters['reference/projectItems']),
        protocol: computed(() => store.getters['reference/protocolItems']),
        cloudServiceType: computed(() => store.getters['reference/cloudServiceTypeItems']),
        cloud_service_type: computed(() => store.getters['reference/cloudServiceTypeItems']),
        collector: computed(() => store.getters['reference/collectorItems']),
        plugin: computed(() => store.getters['reference/pluginItems']),
        provider: computed(() => store.getters['reference/providerItems']),
        region: computed(() => store.getters['reference/regionItems']),
        secret: computed(() => store.getters['reference/secretItems']),
        serviceAccount: computed(() => store.getters['reference/serviceAccountItems']),
        service_account: computed(() => store.getters['reference/serviceAccountItems']),
        user: computed(() => store.getters['reference/userItems']),
        webHook: computed(() => store.getters['reference/webHookItems']),
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
