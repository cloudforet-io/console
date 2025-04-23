import { computed } from 'vue';

import { defineStore } from 'pinia';

import { useAppReferenceStore } from '@/store/reference/app-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import { useCloudServiceTypeReferenceStore } from '@/store/reference/cloud-service-type-reference-store';
import type { CloudServiceQuerySetReferenceMap } from '@/store/reference/cloue-service-query-set-reference-store';
import {
    useCloudServiceQuerySetReferenceStore,
} from '@/store/reference/cloue-service-query-set-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import { useCollectorReferenceStore } from '@/store/reference/collector-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import {
    useCostDataSourceReferenceStore,
} from '@/store/reference/cost-data-source-reference-store';
import type { EscalationPolicyReferenceMap } from '@/store/reference/escalation-policy-reference-store';
import { useEscalationPolicyReferenceStore } from '@/store/reference/escalation-policy-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import { useMetricReferenceStore } from '@/store/reference/metric-reference-store';
import { useNamespaceReferenceStore } from '@/store/reference/namespace-reference-store';
import { usePluginReferenceStore } from '@/store/reference/plugin-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import { useProtocolReferenceStore } from '@/store/reference/protocol-reference-store';
import { useProviderReferenceStore } from '@/store/reference/provider-reference-store';
import { usePublicDashboardReferenceStore } from '@/store/reference/public-dashboard-reference-store';
import type { PublicFolderReferenceMap } from '@/store/reference/public-folder-reference-store';
import { usePublicFolderReferenceStore } from '@/store/reference/public-folder-reference-store';
import { useRegionReferenceStore } from '@/store/reference/region-reference-store';
import { useRoleReferenceStore } from '@/store/reference/role-reference-store';
import { useSecretReferenceStore } from '@/store/reference/secret-reference-store';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';
import { useServiceReferenceStore } from '@/store/reference/service-reference-store';
import { useTrustedAccountReferenceStore } from '@/store/reference/trusted-account-reference-store';
import type { ReferenceLoadOptions } from '@/store/reference/type';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import { useUserGroupReferenceStore } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useWebhookReferenceStore } from '@/store/reference/webhook-reference-store';
import type { WorkspaceGroupReferenceMap } from '@/store/reference/workspace-group-reference-store';
import { useWorkspaceGroupReferenceStore } from '@/store/reference/workspace-group-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';


type PiniaStoreReferenceType =
    'cloud_service_type'
    |'cloud_service_query_set'
    |'collector'
    |'cost_data_source'
    |'plugin'
    |'project_group'
    |'project'
    |'protocol'
    |'provider'
    |'public_dashboard'
    |'public_folder'
    |'region'
    |'secret'
    |'service_account'
    |'trusted_account'
    |'user'
    |'user_group'
    |'webhook'
    |'workspace'
    |'escalation_policy'
    |'metric'
    |'namespace'
    |'workspace_group'
    |'role'
    |'service'
    |'app';

export const useAllReferenceStore = defineStore('all-reference-store', () => {
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
    const userGroupReferenceStore = useUserGroupReferenceStore();
    const publicDashboardReferenceStore = usePublicDashboardReferenceStore();
    const publicFolderReferenceStore = usePublicFolderReferenceStore();
    const serviceAccountReferenceStore = useServiceAccountReferenceStore();
    const webhookReferenceStore = useWebhookReferenceStore();
    const trustedAccountReferenceStore = useTrustedAccountReferenceStore();
    const secretReferenceStore = useSecretReferenceStore();
    const regionReferenceStore = useRegionReferenceStore();
    const escalationPolicyReferenceStore = useEscalationPolicyReferenceStore();
    const namespaceReferenceStore = useNamespaceReferenceStore();
    const metricReferenceStore = useMetricReferenceStore();
    const workspaceGroupReferenceStore = useWorkspaceGroupReferenceStore();
    const roleReferenceStore = useRoleReferenceStore();
    const serviceReferenceStore = useServiceReferenceStore();
    const appReferenceStore = useAppReferenceStore();

    const getters = {
        // REFACTOR: unify into one case (serviceAccount or service_account)
        cloudServiceType: computed<CloudServiceTypeReferenceMap>(() => cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems),
        cloud_service_type: computed<CloudServiceTypeReferenceMap>(() => cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems),
        collector: computed<CollectorReferenceMap>(() => collectorReferenceStore.getters.collectorItems),
        plugin: computed(() => pluginReferenceStore.getters.pluginItems),
        projectGroup: computed<ProjectGroupReferenceMap>(() => projectGroupReferenceStore.getters.projectGroupItems),
        project_group: computed<ProjectGroupReferenceMap>(() => projectGroupReferenceStore.getters.projectGroupItems),
        project: computed<ProjectReferenceMap>(() => projectReferenceStore.getters.projectItems),
        protocol: computed(() => protocolReferenceStore.getters.protocolItems),
        provider: computed(() => providerReferenceStore.getters.providerItems),
        user: computed<UserReferenceMap>(() => userReferenceStore.getters.userItems),
        user_group: computed<UserGroupReferenceMap>(() => userGroupReferenceStore.getters.userGroupItems),
        costDataSource: computed<CostDataSourceReferenceMap>(() => costDataSourceReferenceStore.getters.costDataSourceItems),
        cost_data_source: computed<CostDataSourceReferenceMap>(() => costDataSourceReferenceStore.getters.costDataSourceItems),
        cloudServiceQuerySet: computed<CloudServiceQuerySetReferenceMap>(() => cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetItems),
        cloud_service_query_set: computed<CloudServiceQuerySetReferenceMap>(() => cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetItems),
        workspace: computed<WorkspaceReferenceMap>(() => workspaceReferenceStore.getters.workspaceItems),
        workspace_group: computed<WorkspaceGroupReferenceMap>(() => workspaceGroupReferenceStore.getters.workspaceGroupItems),
        workspaceGroup: computed<WorkspaceGroupReferenceMap>(() => workspaceGroupReferenceStore.getters.workspaceGroupItems),
        publicDashboard: computed(() => publicDashboardReferenceStore.getters.publicDashboardItems),
        public_dashboard: computed(() => publicDashboardReferenceStore.getters.publicDashboardItems),
        publicFolder: computed<PublicFolderReferenceMap>(() => publicFolderReferenceStore.getters.publicFolderItems),
        public_folder: computed<PublicFolderReferenceMap>(() => publicFolderReferenceStore.getters.publicFolderItems),
        serviceAccount: computed(() => serviceAccountReferenceStore.getters.serviceAccountItems),
        service_account: computed(() => serviceAccountReferenceStore.getters.serviceAccountItems),
        webhook: computed(() => webhookReferenceStore.getters.webhookItems),
        trustedAccount: computed(() => trustedAccountReferenceStore.getters.trustedAccountItems),
        trusted_account: computed(() => trustedAccountReferenceStore.getters.trustedAccountItems),
        secret: computed(() => secretReferenceStore.getters.secretItems),
        region: computed(() => regionReferenceStore.getters.regionItems),
        escalationPolicy: computed<EscalationPolicyReferenceMap>(() => escalationPolicyReferenceStore.getters.escalationPolicyItems),
        escalation_policy: computed<EscalationPolicyReferenceMap>(() => escalationPolicyReferenceStore.getters.escalationPolicyItems),
        namespace: computed(() => namespaceReferenceStore.getters.namespaceItems),
        metric: computed<MetricReferenceMap>(() => metricReferenceStore.getters.metricItems),
        role: computed(() => roleReferenceStore.getters.roleItems),
        service: computed<ServiceReferenceMap>(() => serviceReferenceStore.getters.serviceItems),
        app: computed(() => appReferenceStore.getters.appItems),
    };

    const actions = {
        async sync(type: PiniaStoreReferenceType, data?: any) {
            switch (type) {
            case 'cloud_service_type':
                await cloudServiceTypeReferenceStore.sync(data); break;
            case 'collector':
                await collectorReferenceStore.sync(data); break;
            case 'plugin':
                await pluginReferenceStore.sync(data); break;
            case 'project':
                await projectReferenceStore.sync(data); break;
            case 'project_group':
                await projectGroupReferenceStore.sync(data); break;
            case 'protocol':
                await protocolReferenceStore.sync(data); break;
            case 'provider':
                await providerReferenceStore.sync(data); break;
            case 'workspace':
                await workspaceReferenceStore.sync(data); break;
            case 'workspace_group':
                await workspaceGroupReferenceStore.sync(data); break;
            case 'user':
                await userReferenceStore.sync(data); break;
            case 'user_group':
                await userGroupReferenceStore.sync(data); break;
            case 'public_dashboard':
                await publicDashboardReferenceStore.sync(data); break;
            case 'public_folder':
                await publicFolderReferenceStore.sync(data); break;
            case 'service_account':
                await serviceAccountReferenceStore.sync(data); break;
            case 'webhook':
                await webhookReferenceStore.sync(data); break;
            case 'trusted_account':
                await trustedAccountReferenceStore.sync(data); break;
            case 'secret':
                await secretReferenceStore.sync(data); break;
            case 'region':
                await regionReferenceStore.sync(data); break;
            case 'escalation_policy':
                await escalationPolicyReferenceStore.sync(data); break;
            case 'namespace':
                await namespaceReferenceStore.sync(data); break;
            case 'metric':
                await metricReferenceStore.sync(data); break;
            case 'role':
                await roleReferenceStore.sync(data); break;
            case 'service':
                await serviceReferenceStore.sync(data); break;
            case 'app':
                await appReferenceStore.sync(data); break;
            default: break;
            }
        },
        async load(type: PiniaStoreReferenceType, options?: ReferenceLoadOptions) {
            switch (type) {
            case 'cloud_service_type':
                await cloudServiceTypeReferenceStore.load(options); break;
            case 'collector':
                await collectorReferenceStore.load(options); break;
            case 'cost_data_source':
                await costDataSourceReferenceStore.load(options); break;
            case 'cloud_service_query_set':
                await cloudServiceQuerySetReferenceStore.load(options); break;
            case 'plugin':
                await pluginReferenceStore.load(options); break;
            case 'project':
                await projectReferenceStore.load(options); break;
            case 'project_group':
                await projectGroupReferenceStore.load(options); break;
            case 'protocol':
                await protocolReferenceStore.load(options); break;
            case 'workspace':
                await workspaceReferenceStore.load(options); break;
            case 'workspace_group':
                await workspaceGroupReferenceStore.load(options); break;
            case 'user':
                await userReferenceStore.load(options); break;
            case 'user_group':
                await userGroupReferenceStore.load(options); break;
            case 'public_dashboard':
                await publicDashboardReferenceStore.load(options); break;
            case 'public_folder':
                await publicFolderReferenceStore.load(options); break;
            case 'provider':
                await providerReferenceStore.load(options); break;
            case 'service_account':
                await serviceAccountReferenceStore.load(options); break;
            case 'webhook':
                await webhookReferenceStore.load(options); break;
            case 'trusted_account':
                await trustedAccountReferenceStore.load(options); break;
            case 'secret':
                await secretReferenceStore.load(options); break;
            case 'region':
                await regionReferenceStore.load(options); break;
            case 'escalation_policy':
                await escalationPolicyReferenceStore.load(options); break;
            case 'namespace':
                await namespaceReferenceStore.load(options); break;
            case 'metric':
                await metricReferenceStore.load(options); break;
            case 'role':
                await roleReferenceStore.load(options); break;
            case 'service':
                await serviceReferenceStore.load(options); break;
            case 'app':
                await appReferenceStore.load(options); break;
            default: break;
            }
        },
        flush() {
            cloudServiceTypeReferenceStore.flush();
            collectorReferenceStore.flush();
            costDataSourceReferenceStore.flush();
            cloudServiceQuerySetReferenceStore.flush();
            pluginReferenceStore.flush();
            projectReferenceStore.flush();
            projectGroupReferenceStore.flush();
            protocolReferenceStore.flush();
            providerReferenceStore.flush();
            workspaceReferenceStore.flush();
            workspaceGroupReferenceStore.flush();
            userReferenceStore.flush();
            userGroupReferenceStore.flush();
            publicDashboardReferenceStore.flush();
            publicFolderReferenceStore.flush();
            serviceAccountReferenceStore.flush();
            webhookReferenceStore.flush();
            trustedAccountReferenceStore.flush();
            secretReferenceStore.flush();
            regionReferenceStore.flush();
            escalationPolicyReferenceStore.flush();
            namespaceReferenceStore.flush();
            metricReferenceStore.flush();
            roleReferenceStore.flush();
            serviceReferenceStore.flush();
            appReferenceStore.flush();
        },
    };

    return {
        getters,
        ...actions,
    };
});
