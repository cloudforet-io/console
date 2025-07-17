import { useAlertManagerEscalationPolicyReferenceDataModel } from '@/query/resource-query/reference-model/use-alert-manager-escalation-policy-reference-data-model';
import { useAlertManagerWebhookReferenceDataModel } from '@/query/resource-query/reference-model/use-alert-manager-webhook-reference-data-model';
import { useAppReferenceDataModel } from '@/query/resource-query/reference-model/use-app-reference-data-model';
import { useCloudServiceTypeReferenceDataModel } from '@/query/resource-query/reference-model/use-cloud-service-type-reference-data-model';
import { useCollectorReferenceDataModel } from '@/query/resource-query/reference-model/use-collector-reference-data-model';
import { useCostDataSourceReferenceModel } from '@/query/resource-query/reference-model/use-cost-data-source-reference-data-model';
import { useMetricReferenceDataModel } from '@/query/resource-query/reference-model/use-metric-reference-data-model';
import { useMonitoringEscalationPolicyReferenceDataModel } from '@/query/resource-query/reference-model/use-monitoring-escalation-policy-reference-data-model';
import { useMonitoringWebhookReferenceDataModel } from '@/query/resource-query/reference-model/use-monitoring-webhook-reference-data-model';
import { useNamespaceReferenceDataModel } from '@/query/resource-query/reference-model/use-namespace-reference-data-model';
import { usePluginReferenceDataModel } from '@/query/resource-query/reference-model/use-plugin-reference-data-model';
import { useProjectGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-project-group-reference-data-model';
import { useProjectReferenceDataModel } from '@/query/resource-query/reference-model/use-project-reference-data-model';
import { useProtocolReferenceDataModel } from '@/query/resource-query/reference-model/use-protocol-reference-data-model';
import { useProvodierReferenceDataModel } from '@/query/resource-query/reference-model/use-provider-reference-data-model';
import { useRegionReferenceDataModel } from '@/query/resource-query/reference-model/use-region-reference-data-model';
import { useRoleReferenceDataModel } from '@/query/resource-query/reference-model/use-role-reference-data-model';
import { useSecretReferenceDataModel } from '@/query/resource-query/reference-model/use-secret-reference-data-model';
import { useServiceAccountReferenceDataModel } from '@/query/resource-query/reference-model/use-service-account-reference-data-model';
import { useServiceReferenceDataModel } from '@/query/resource-query/reference-model/use-service-reference-data-model';
import { useTrustedAccountReferenceDataModel } from '@/query/resource-query/reference-model/use-trusted-account-reference-data-model';
import { useUserGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-user-group-reference-data-model';
import { useUserReferenceDataModel } from '@/query/resource-query/reference-model/use-user-reference-data-model';
import { useWorkspaceGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-workspace-group-reference-data-model';
import { useWorkspaceReferenceDataModel } from '@/query/resource-query/reference-model/use-workspace-reference-data-model';
import { useWorkspaceUserReferenceDataModel } from '@/query/resource-query/reference-model/use-workspace-user-reference-data-model';
import { makeResourceProxy } from '@/query/resource-query/shared/utils/resource-proxy-helper';

const referenceDataModelMap = {
    app: useAppReferenceDataModel,
    workspace: useWorkspaceReferenceDataModel,
    workspaceGroup: useWorkspaceGroupReferenceDataModel,
    user: useUserReferenceDataModel,
    workspaceUser: useWorkspaceUserReferenceDataModel,
    userGroup: useUserGroupReferenceDataModel,
    provider: useProvodierReferenceDataModel,
    protocol: useProtocolReferenceDataModel,
    cloudServiceType: useCloudServiceTypeReferenceDataModel,
    collector: useCollectorReferenceDataModel,
    costDataSource: useCostDataSourceReferenceModel,
    metric: useMetricReferenceDataModel,
    namespace: useNamespaceReferenceDataModel,
    project: useProjectReferenceDataModel,
    projectGroup: useProjectGroupReferenceDataModel,
    role: useRoleReferenceDataModel,
    region: useRegionReferenceDataModel,
    secret: useSecretReferenceDataModel,
    plugin: usePluginReferenceDataModel,
    serviceAccount: useServiceAccountReferenceDataModel,
    trustedAccount: useTrustedAccountReferenceDataModel,
    alertManagerWebhook: useAlertManagerWebhookReferenceDataModel,
    monitoringWebhook: useMonitoringWebhookReferenceDataModel,
    service: useServiceReferenceDataModel,
    alertManagerEscalationPolicy: useAlertManagerEscalationPolicyReferenceDataModel,
    monitoringEscalationPolicy: useMonitoringEscalationPolicyReferenceDataModel,
} as const;

const proxy = makeResourceProxy<typeof referenceDataModelMap>(referenceDataModelMap, (target, prop) => {
    if (!(prop in target)) {
        throw new Error(`[all-reference-data-model] Reference Data Model for "${prop}" not found`);
    }
    return target[prop]().map;
});

export const useAllReferenceDataModel = () => proxy;
