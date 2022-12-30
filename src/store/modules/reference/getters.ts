import type { Getter } from 'vuex';

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
import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';

export const projectItems: Getter<any, any> = (state): ProjectReferenceMap => state.project?.items ?? {};

export const projectGroupItems: Getter<any, any> = (state): ProjectGroupReferenceMap => state.projectGroup?.items ?? {};

export const protocolItems: Getter<any, any> = (state): ProtocolReferenceMap => state.protocol?.items ?? {};

export const cloudServiceTypeItems: Getter<any, any> = (state): CloudServiceTypeReferenceMap => state.cloudServiceType?.items ?? {};

export const collectorItems: Getter<any, any> = (state): CollectorReferenceMap => state.collector?.items ?? {};

export const pluginItems: Getter<any, any> = (state): PluginReferenceMap => state.plugin?.items ?? {};

export const providerItems: Getter<any, any> = (state): ProviderReferenceMap => state.provider?.items ?? {};

export const regionItems: Getter<any, any> = (state): RegionReferenceMap => state.region?.items ?? {};

export const secretItems: Getter<any, any> = (state): SecretReferenceMap => state.secret?.items ?? {};

export const serviceAccountItems: Getter<any, any> = (state): ServiceAccountReferenceMap => state.serviceAccount?.items ?? {};

export const userItems: Getter<any, any> = (state): UserReferenceMap => state.user?.items ?? {};

export const webhookItems: Getter<any, any> = (state): WebhookReferenceMap => state.webhook?.items ?? {};

export const allReferenceTypeInfo: Getter<any, any> = (state, getters): AllReferenceTypeInfo => ({
    projectGroup: {
        type: 'projectGroup',
        key: 'project_group_id',
        name: 'Project Group',
        referenceMap: getters.projectGroupItems,
    },
    project: {
        type: 'project',
        key: 'project_id',
        name: 'Project',
        referenceMap: getters.projectItems,
    },
    protocol: {
        type: 'protocol',
        key: 'protocol_id',
        name: 'Protocol',
        referenceMap: getters.protocolItems,
    },
    cloudServiceType: {
        type: 'cloudServiceType',
        key: 'cloud_service_type',
        name: 'Cloud Service Type',
        referenceMap: getters.cloudServiceTypeItems,
    },
    collector: {
        type: 'collector',
        key: 'collector_id',
        name: 'Collector',
        referenceMap: getters.collectorItems,
    },
    plugin: {
        type: 'plugin',
        key: 'plugin_id',
        name: 'Plugin',
        referenceMap: getters.pluginItems,
    },
    provider: {
        type: 'provider',
        key: 'provider',
        name: 'Provider',
        referenceMap: getters.providerItems,
    },
    region: {
        type: 'region',
        key: 'region_code',
        name: 'Region',
        referenceMap: getters.regionItems,
    },
    secret: {
        type: 'secret',
        key: 'secret_id',
        name: 'Secret',
        referenceMap: getters.secretItems,
    },
    serviceAccount: {
        type: 'serviceAccount',
        key: 'service_account_id',
        name: 'Service Account',
        referenceMap: getters.serviceAccountItems,
    },
    user: {
        type: 'user',
        key: 'user_id',
        name: 'User',
        referenceMap: getters.userItems,
    },
    webhook: {
        type: 'webhook',
        key: 'webhook_id',
        name: 'Webhook',
        referenceMap: getters.webhookItems,
    },
});
