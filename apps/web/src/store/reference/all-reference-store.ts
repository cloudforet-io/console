import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

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
import type { TrustedAccountReferenceMap } from '@/store/modules/reference/trusted-account/type';
import type {
    ReferenceMap,
    VuexStoreReferenceType,
} from '@/store/modules/reference/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import { useCloudServiceQuerySetReferenceStore } from '@/store/reference/cloue-service-query-set-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import {
    useCostDataSourceReferenceStore,
} from '@/store/reference/cost-data-source-reference-store';
import { useProjectGroupStore } from '@/store/reference/project-group-store';
import { useProjectStore } from '@/store/reference/project-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';


export type ReferenceType = VuexStoreReferenceType|'costDataSource'|'cloudServiceQuerySet'|'workspace';

export interface ReferenceTypeInfo {
    type: ReferenceType;
    key: string; // project_id
    name: string; // Project
    referenceMap: ReferenceMap;
}
export type AllReferenceTypeInfo = Record<ReferenceType, ReferenceTypeInfo>;

export const useAllReferenceStore = defineStore('all-reference-store', () => {
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
    const cloudServiceQuerySetReferenceStore = useCloudServiceQuerySetReferenceStore();
    const projectReferenceStore = useProjectStore();
    const projectGroupReferenceStore = useProjectGroupStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();

    const getters = reactive({
        allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => ({
            projectGroup: projectGroupReferenceStore.getters.projectGroupTypeInfo,
            project_group: projectGroupReferenceStore.getters.projectGroupTypeInfo,
            //
            project: projectReferenceStore.getters.projectTypeInfo,
            //
            protocol: {
                ...REFERENCE_TYPE_INFO.protocol,
                referenceMap: getters.protocol,
            },
            //
            cloudServiceType: {
                ...REFERENCE_TYPE_INFO.cloud_service_type,
                referenceMap: getters.cloudServiceType,
            },
            cloud_service_type: {
                ...REFERENCE_TYPE_INFO.cloud_service_type,
                referenceMap: getters.cloudServiceType,
            },
            //
            collector: {
                ...REFERENCE_TYPE_INFO.collector,
                referenceMap: getters.collector,
            },
            //
            plugin: {
                ...REFERENCE_TYPE_INFO.plugin,
                referenceMap: getters.plugin,
            },
            //
            provider: {
                ...REFERENCE_TYPE_INFO.provider,
                referenceMap: getters.provider,
            },
            //
            region: {
                ...REFERENCE_TYPE_INFO.region,
                referenceMap: getters.region,
            },
            //
            secret: {
                ...REFERENCE_TYPE_INFO.secret,
                referenceMap: getters.secret,
            },
            //
            serviceAccount: {
                ...REFERENCE_TYPE_INFO.service_account,
                referenceMap: getters.serviceAccount,
            },
            trustedAccount: {
                ...REFERENCE_TYPE_INFO.trusted_account,
                referenceMap: getters.trustedAccount,
            },
            service_account: {
                ...REFERENCE_TYPE_INFO.service_account,
                referenceMap: getters.serviceAccount,
            },
            //
            user: {
                ...REFERENCE_TYPE_INFO.user,
                referenceMap: getters.user,
            },
            //
            webhook: {
                ...REFERENCE_TYPE_INFO.webhook,
                referenceMap: getters.webhook,
            },
            //
            costDataSource: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
            cloudServiceQuerySet: cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetTypeInfo,
            workspace: workspaceReferenceStore.getters.workspaceTypeInfo,
        })),
        projectGroup: computed<ProjectGroupReferenceMap>(() => projectGroupReferenceStore.getters.projectGroupItems),
        project_group: asyncComputed<ProjectGroupReferenceMap>(async () => projectGroupReferenceStore.getters.projectGroupItems),
        project: asyncComputed<ProjectReferenceMap>(async () => projectReferenceStore.getters.projectItems),
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
        trustedAccount: asyncComputed<TrustedAccountReferenceMap>(async () => {
            await store.dispatch('reference/trustedAccount/load');
            return store.getters['reference/trustedAccountItems'];
        }, {}, { lazy: true }),
        service_account: asyncComputed<ServiceAccountReferenceMap>(async () => {
            await store.dispatch('reference/serviceAccount/load');
            return store.getters['reference/serviceAccountItems'];
        }, {}, { lazy: true }),
        user: asyncComputed<UserReferenceMap>(async () => {
            await store.dispatch('reference/user/load');
            return store.getters['reference/userItems'];
        }, {}, { lazy: true }),
        webhook: asyncComputed<UserReferenceMap>(async () => {
            await store.dispatch('reference/webhook/load');
            return store.getters['reference/webhookItems'];
        }, {}, { lazy: true }),
        costDataSource: computed<CostDataSourceReferenceMap>(() => costDataSourceReferenceStore.getters.costDataSourceItems),
        cloudServiceQuerySet: computed<CloudServiceTypeReferenceMap>(() => cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetItems),
        workspace: computed<CloudServiceTypeReferenceMap>(() => workspaceReferenceStore.getters.workspaceItems),
    });

    const actions = {
        flush() {
            costDataSourceReferenceStore.flush();
            cloudServiceQuerySetReferenceStore.flush();
            projectReferenceStore.flush();
            projectGroupReferenceStore.flush();
            workspaceReferenceStore.flush();
        },
    };

    return {
        getters,
        ...actions,
    };
});
