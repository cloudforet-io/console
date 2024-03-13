import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { store } from '@/store';

import type { ReferenceTypeInfo } from '@/store/modules/reference/type';
import { useCloudServiceTypeReferenceStore } from '@/store/reference/cloud-service-type-reference-store';
import { useCloudServiceQuerySetReferenceStore } from '@/store/reference/cloue-service-query-set-reference-store';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import { useRegionReferenceStore } from '@/store/reference/region-reference-store';
import { useSecretReferenceStore } from '@/store/reference/secret-reference-store';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useWebhookReferenceStore } from '@/store/reference/webhook-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import type { ManagedVariableModelKey } from '@/lib/variable-models/managed';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';



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
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
    const cloudServiceQuerySetReferenceStore = useCloudServiceQuerySetReferenceStore();
    const projectReferenceStore = useProjectReferenceStore();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const userReferenceStore = useUserReferenceStore();
    const serviceAccountReferenceStore = useServiceAccountReferenceStore();
    const webhookReferenceStore = useWebhookReferenceStore();
    const secretReferenceStore = useSecretReferenceStore();
    const regionReferenceStore = useRegionReferenceStore();

    const getters = reactive({
        allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => ({
            protocol: {
                type: 'protocol',
                key: 'protocol_id',
                name: 'Protocol',
                referenceMap: store.getters['reference/protocolItems'],
            },
            plugin: {
                type: 'plugin',
                key: 'plugin_id',
                name: 'Plugin',
                referenceMap: store.getters['reference/pluginItems'],
            },
            provider: {
                type: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key,
                key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.idKey as string,
                name: MANAGED_VARIABLE_MODEL_CONFIGS.provider.name,
                referenceMap: store.getters['reference/providerItems'],
            },
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

    (async () => {
        await store.dispatch('reference/loadAll');
    })();

    return {
        getters,
    };
});
