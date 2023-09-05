import { asyncComputed } from '@vueuse/core';
import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { store } from '@/store';

import type { VuexAllReferenceTypeInfo, ReferenceMap, VuexStoreReferenceType } from '@/store/modules/reference/type';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';

import type { COST_REFERENCE_TYPE_INFO } from '@/lib/reference/cost-reference-config';


export type ReferenceType = VuexStoreReferenceType|'cost_data_source';
export interface ReferenceTypeInfo {
    type: ReferenceType;
    key: string; // project_id
    name: string; // Project
    referenceMap: ReferenceMap;
}
export interface AllReferenceTypeInfo extends VuexAllReferenceTypeInfo {
    [COST_REFERENCE_TYPE_INFO.cost_data_source.type]: ReferenceTypeInfo;
}

export const useAllReferenceStore = defineStore('all-reference-store', () => {
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();

    const getters = reactive({
        allReferenceTypeInfo: asyncComputed(() => ({
            ...store.getters['reference/allReferenceTypeInfo'],
            cost_data_source: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
        })),
    });

    const actions = {
        async loadAll() {
            await Promise.allSettled([
                store.dispatch('reference/loadAll'),
                costDataSourceReferenceStore.load(),
            ]);
        },
    };

    return {
        getters,
        ...actions,
    };
});
