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

export const useAllReferenceDataModel = () => ({
    app: useAppReferenceDataModel().map,
    workspace: useWorkspaceReferenceDataModel().map,
    workspaceGroup: useWorkspaceGroupReferenceDataModel().map,
    user: useUserReferenceDataModel().map,
    workspaceUser: useWorkspaceUserReferenceDataModel().map,
    userGroup: useUserGroupReferenceDataModel().map,
    provider: useProvodierReferenceDataModel().map,
    protocol: useProtocolReferenceDataModel().map,
    cloudServiceType: useCloudServiceTypeReferenceDataModel().map,
    collector: useCollectorReferenceDataModel().map,
    costDataSource: useCostDataSourceReferenceModel().map,
    metric: useMetricReferenceDataModel().map,
    namespace: useNamespaceReferenceDataModel().map,
    project: useProjectReferenceDataModel().map,
    projectGroup: useProjectGroupReferenceDataModel().map,
    role: useRoleReferenceDataModel().map,
    region: useRegionReferenceDataModel().map,
    secret: useSecretReferenceDataModel().map,
    plugin: usePluginReferenceDataModel().map,
    serviceAccount: useServiceAccountReferenceDataModel().map,
    trustedAccount: useTrustedAccountReferenceDataModel().map,
    alertManagerWebhook: useAlertManagerWebhookReferenceDataModel().map,
    monitoringWebhook: useMonitoringWebhookReferenceDataModel().map,
    service: useServiceReferenceDataModel().map,
    alertManagerEscalationPolicy: useAlertManagerEscalationPolicyReferenceDataModel().map,
    monitoringEscalationPolicy: useMonitoringEscalationPolicyReferenceDataModel().map,
});

