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
import type { VuexStoreAllReferenceTypeInfo } from '@/store/modules/reference/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';

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

export const allReferenceTypeInfo: Getter<any, any> = (state, getters): VuexStoreAllReferenceTypeInfo => ({
    projectGroup: {
        ...REFERENCE_TYPE_INFO.project_group,
        referenceMap: getters.projectGroupItems,
    },
    project_group: {
        ...REFERENCE_TYPE_INFO.project_group,
        referenceMap: getters.projectGroupItems,
    },
    //
    project: {
        ...REFERENCE_TYPE_INFO.project,
        referenceMap: getters.projectItems,
    },
    //
    protocol: {
        ...REFERENCE_TYPE_INFO.protocol,
        referenceMap: getters.protocolItems,
    },
    //
    cloudServiceType: {
        ...REFERENCE_TYPE_INFO.cloud_service_type,
        referenceMap: getters.cloudServiceTypeItems,
    },
    cloud_service_type: {
        ...REFERENCE_TYPE_INFO.cloud_service_type,
        referenceMap: getters.cloudServiceTypeItems,
    },
    //
    collector: {
        ...REFERENCE_TYPE_INFO.collector,
        referenceMap: getters.collectorItems,
    },
    //
    plugin: {
        ...REFERENCE_TYPE_INFO.plugin,
        referenceMap: getters.pluginItems,
    },
    //
    provider: {
        ...REFERENCE_TYPE_INFO.provider,
        referenceMap: getters.providerItems,
    },
    //
    region: {
        ...REFERENCE_TYPE_INFO.region,
        referenceMap: getters.regionItems,
    },
    //
    secret: {
        ...REFERENCE_TYPE_INFO.secret,
        referenceMap: getters.secretItems,
    },
    //
    serviceAccount: {
        ...REFERENCE_TYPE_INFO.service_account,
        referenceMap: getters.serviceAccountItems,
    },
    service_account: {
        ...REFERENCE_TYPE_INFO.service_account,
        referenceMap: getters.serviceAccountItems,
    },
    //
    user: {
        ...REFERENCE_TYPE_INFO.user,
        referenceMap: getters.userItems,
    },
    //
    webhook: {
        ...REFERENCE_TYPE_INFO.webhook,
        referenceMap: getters.webhookItems,
    },
});
