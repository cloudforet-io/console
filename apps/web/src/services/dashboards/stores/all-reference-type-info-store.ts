import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useCloudServiceTypeReferenceStore } from '@/store/reference/cloud-service-type-reference-store';
import { useCloudServiceQuerySetReferenceStore } from '@/store/reference/cloue-service-query-set-reference-store';
import { useCollectorReferenceStore } from '@/store/reference/collector-reference-store';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';
import { usePluginReferenceStore } from '@/store/reference/plugin-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import { useProtocolReferenceStore } from '@/store/reference/protocol-reference-store';
import { useProviderReferenceStore } from '@/store/reference/provider-reference-store';
import { useRegionReferenceStore } from '@/store/reference/region-reference-store';
import { useSecretReferenceStore } from '@/store/reference/secret-reference-store';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';
import type { ReferenceTypeInfo } from '@/store/reference/type';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useWebhookReferenceStore } from '@/store/reference/webhook-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import type { ManagedVariableModelKey } from '@/lib/variable-models/managed';


export type ReferenceType = Extract<ManagedVariableModelKey,
    | 'protocol'
    | 'cloud_service_type'
    | 'plugin'
    | 'provider'
    | 'region'
    | 'secret'
    | 'service_account'
    | 'webhook'
    | 'project_group'
    | 'project'
    | 'user'
    | 'cost_data_source'
    | 'cloud_service_query_set'
    | 'workspace'
>;
export type AllReferenceTypeInfo = Record<ReferenceType, ReferenceTypeInfo>;

export const useAllReferenceTypeInfoStore = defineStore('all-reference-type-info', () => {
    const cloudServiceTypeReferenceStore = useCloudServiceTypeReferenceStore();
    const collectorReferenceStore = useCollectorReferenceStore();
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
    const cloudServiceQuerySetReferenceStore = useCloudServiceQuerySetReferenceStore();
    const pluginReferenceStore = usePluginReferenceStore();
    const projectReferenceStore = useProjectReferenceStore();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const protocolReferenceStore = useProtocolReferenceStore();
    const providerReferenceStore = useProviderReferenceStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const userReferenceStore = useUserReferenceStore();
    const serviceAccountReferenceStore = useServiceAccountReferenceStore();
    const webhookReferenceStore = useWebhookReferenceStore();
    const secretReferenceStore = useSecretReferenceStore();
    const regionReferenceStore = useRegionReferenceStore();

    const getters = reactive({
        allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => ({
            protocol: protocolReferenceStore.getters.protocolTypeInfo,
            plugin: pluginReferenceStore.getters.pluginTypeInfo,
            provider: providerReferenceStore.getters.providerTypeInfo,
            collector: collectorReferenceStore.getters.collectorTypeInfo,
            cloud_service_type: cloudServiceTypeReferenceStore.getters.cloudServiceTypeTypeInfo,
            service_account: serviceAccountReferenceStore.getters.serviceAccountTypeInfo,
            project_group: projectGroupReferenceStore.getters.projectGroupTypeInfo,
            project: projectReferenceStore.getters.projectTypeInfo,
            user: userReferenceStore.getters.userTypeInfo,
            cost_data_source: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
            cloud_service_query_set: cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetTypeInfo,
            workspace: workspaceReferenceStore.getters.workspaceTypeInfo,
            webhook: webhookReferenceStore.getters.webhookTypeInfo,
            secret: secretReferenceStore.getters.secretTypeInfo,
            region: regionReferenceStore.getters.regionTypeInfo,
        })),
    });

    return {
        getters,
    };
});
