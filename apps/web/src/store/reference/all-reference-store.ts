import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { camelCase } from 'lodash';
import { defineStore } from 'pinia';

import { store } from '@/store';

import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProtocolReferenceMap } from '@/store/modules/reference/protocol/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { SecretReferenceMap } from '@/store/modules/reference/secret/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';
import type {
    ReferenceMap,
    VuexStoreReferenceType,
    ReferenceLoadOptions,
} from '@/store/modules/reference/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import {
    useCostDataSourceReferenceStore,
} from '@/store/reference/cost-data-source-reference-store';

export type ReferenceType = VuexStoreReferenceType|'costDataSource'|'cost_data_source';

export interface ReferenceTypeInfo {
    type: ReferenceType;
    key: string; // project_id
    name: string; // Project
    referenceMap: ReferenceMap;
}
export type AllReferenceTypeInfo = Record<ReferenceType, ReferenceTypeInfo>;

export const useAllReferenceStore = defineStore('all-reference-store', () => {
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();

    const getters = reactive({
        allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => ({
            ...store.getters['reference/allReferenceTypeInfo'],
            costDataSource: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
            cost_data_source: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
        })),
        projectGroup: asyncComputed<ProjectGroupReferenceMap>(async () => {
            await store.dispatch('reference/projectGroup/load');
            return store.getters['reference/projectGroupItems'];
        }, {}, { lazy: true }),
        project_group: asyncComputed<ProjectGroupReferenceMap>(async () => {
            await store.dispatch('reference/projectGroup/load');
            return store.getters['reference/projectGroupItems'];
        }, {}, { lazy: true }),
        project: asyncComputed<ProjectReferenceMap>(async () => {
            await store.dispatch('reference/project/load');
            return store.getters['reference/projectItems'];
        }, {}, { lazy: true }),
        protocol: asyncComputed<ProtocolReferenceMap>(async () => {
            await store.dispatch('reference/protocol/load');
            return store.getters['reference/protocolItems'];
        }, {}, { lazy: true }),
        cloudServiceType: asyncComputed<CloudServiceTypeReferenceMap>(async () => {
            await store.dispatch('reference/cloudServiceType/load');
            return store.getters['reference/cloudServiceTypeItems'];
        }, {}, { lazy: true }),
        cloud_service_type: asyncComputed<CloudServiceTypeReferenceMap>(async () => {
            await store.dispatch('reference/cloudServiceType/load');
            return store.getters['reference/cloudServiceTypeItems'];
        }, {}, { lazy: true }),
        collector: asyncComputed<CollectorReferenceMap>(async () => {
            await store.dispatch('reference/collector/load');
            return store.getters['reference/collectorItems'];
        }, {}, { lazy: true }),
        plugin: asyncComputed<PluginReferenceMap>(async () => {
            await store.dispatch('reference/plugin/load');
            return store.getters['reference/pluginItems'];
        }, {}),
        provider: asyncComputed<ProviderReferenceMap>(async () => {
            await store.dispatch('reference/provider/load');
            return store.getters['reference/providerItems'];
        }, {}, { lazy: true }),
        region: asyncComputed<RegionReferenceMap>(async () => {
            await store.dispatch('reference/region/load');
            return store.getters['reference/regionItems'];
        }, {}, { lazy: true }),
        secret: asyncComputed<SecretReferenceMap>(async () => {
            await store.dispatch('reference/secret/load');
            return store.getters['reference/secretItems'];
        }, {}, { lazy: true }),
        serviceAccount: asyncComputed<ServiceAccountReferenceMap>(async () => {
            await store.dispatch('reference/serviceAccount/load');
            return store.getters['reference/serviceAccountItems'];
        }, {}, { lazy: true }),
        service_account: asyncComputed<ServiceAccountReferenceMap>(async () => {
            await store.dispatch('reference/serviceAccount/load');
            return store.getters['reference/serviceAccountItems'];
        }, {}, { lazy: true }),
        user: asyncComputed<UserReferenceMap>(async () => {
            await store.dispatch('reference/user/load');
            return store.getters['reference/userItems'];
        }, {}, { lazy: true }),
        webHook: asyncComputed<UserReferenceMap>(async () => {
            await store.dispatch('reference/webHook/load');
            return store.getters['reference/webHookItems'];
        }, {}, { lazy: true }),
        costDataSource: computed<CostDataSourceReferenceMap>(() => costDataSourceReferenceStore.getters.costDataSourceItems),
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
