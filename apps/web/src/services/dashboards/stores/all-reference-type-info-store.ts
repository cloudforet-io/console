import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { store } from '@/store';

import type { ReferenceTypeInfo } from '@/store/modules/reference/type';
import { useCloudServiceQuerySetReferenceStore } from '@/store/reference/cloue-service-query-set-reference-store';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

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
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
    const cloudServiceQuerySetReferenceStore = useCloudServiceQuerySetReferenceStore();
    const projectReferenceStore = useProjectReferenceStore();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const userReferenceStore = useUserReferenceStore();

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
            cloud_service_type: {
                type: MANAGED_VARIABLE_MODELS.cloud_service_type.prototype.meta.key,
                key: MANAGED_VARIABLE_MODELS.cloud_service_type.prototype.meta.idKey,
                name: MANAGED_VARIABLE_MODELS.cloud_service_type.prototype.meta.name,
                referenceMap: store.getters['reference/cloudServiceTypeItems'],
            },
            provider: {
                type: MANAGED_VARIABLE_MODELS.provider.prototype.meta.key,
                key: MANAGED_VARIABLE_MODELS.provider.prototype.meta.idKey as string,
                name: MANAGED_VARIABLE_MODELS.provider.prototype.meta.name,
                referenceMap: store.getters['reference/providerItems'],
            },
            region: {
                type: MANAGED_VARIABLE_MODELS.region.prototype.meta.key,
                key: MANAGED_VARIABLE_MODELS.region.prototype.meta.idKey as string,
                name: MANAGED_VARIABLE_MODELS.region.prototype.meta.name,
                referenceMap: store.getters['reference/regionItems'],
            },
            secret: {
                type: MANAGED_VARIABLE_MODELS.secret.prototype.meta.key,
                key: MANAGED_VARIABLE_MODELS.secret.prototype.meta.idKey as string,
                name: MANAGED_VARIABLE_MODELS.secret.prototype.meta.name,
                referenceMap: store.getters['reference/secretItems'],
            },
            service_account: {
                type: MANAGED_VARIABLE_MODELS.service_account.prototype.meta.key,
                key: MANAGED_VARIABLE_MODELS.service_account.prototype.meta.idKey as string,
                name: MANAGED_VARIABLE_MODELS.service_account.prototype.meta.name,
                referenceMap: store.getters['reference/serviceAccountItems'],
            },
            webhook: {
                type: MANAGED_VARIABLE_MODELS.webhook.prototype.meta.key,
                key: MANAGED_VARIABLE_MODELS.webhook.prototype.meta.idKey as string,
                name: MANAGED_VARIABLE_MODELS.webhook.prototype.meta.name,
                referenceMap: store.getters['reference/webhookItems'],
            },
            project_group: projectGroupReferenceStore.getters.projectGroupTypeInfo,
            project: projectReferenceStore.getters.projectTypeInfo,
            user: userReferenceStore.getters.userTypeInfo,
            cost_data_source: costDataSourceReferenceStore.getters.costDataSourceTypeInfo,
            cloud_service_query_set: cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetTypeInfo,
            workspace: workspaceReferenceStore.getters.workspaceTypeInfo,
        })),
    });

    (async () => {
        await store.dispatch('reference/loadAll');
    })();

    return {
        getters,
    };
});
