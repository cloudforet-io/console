import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';

export const RESOURCE_MENU_FETCH_CONFIG: Record<ResourceKeyType, { only?: string[], searchTargets?: string[] }> = {
    app: {
        searchTargets: ['name'],
    },
    // cloudServiceQuerySet: {
    //     searchTargets: ['name', 'query_set_id'],
    // },
    cloudServiceType: {
        only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'],
        searchTargets: ['cloud_service_type_id', 'name', 'group'],
    },
    collector: {
        searchTargets: ['name', 'collector_id'],
    },
    costDataSource: {
        searchTargets: ['name'],
    },
    projectGroup: {
        searchTargets: ['name', 'project_group_id'],
    },
    project: {
        only: ['project_id', 'name', 'project_group_id'],
        searchTargets: ['name'],
    },
    provider: {
        searchTargets: ['name', 'provider'],
    },
    region: {
        searchTargets: ['name', 'provider', 'region_code'],
    },
    role: {
        searchTargets: ['name', 'role_id', 'role_type'],
    },
    secret: {
        searchTargets: ['name', 'secret_id'],
    },
    serviceAccount: {
        searchTargets: ['name'],
    },
    trustedAccount: {
        searchTargets: ['name', 'trusted_account_id'],
    },
    service: {
        searchTargets: ['name'],
    },
    userGroup: {
        searchTargets: ['name', 'user_group_id'],
    },
    user: {
        searchTargets: ['name', 'user_id'],
    },
    workspaceUser: {
        searchTargets: ['name', 'user_id'],
    },
    alertManagerWebhook: {
        searchTargets: ['name', 'webhook_id'],
    },
    monitoringWebhook: {
        searchTargets: ['name', 'webhook_id'],
    },
    workspaceGroup: {
        searchTargets: ['name'],
    },
    workspace: {
        searchTargets: ['name', 'workspace_id'],
    },
    protocol: {
        searchTargets: ['name', 'protocol_id'],
    },
    alertManagerEscalationPolicy: {
        searchTargets: ['name', 'escalation_policy_id'],
    },
    monitoringEscalationPolicy: {
        searchTargets: ['name', 'escalation_policy_id'],
    },
    plugin: {
        searchTargets: ['name', 'plugin_id'],
    },
    metric: {
        searchTargets: ['name', 'metric_id'],
    },
    metricData: {},
    namespace: {
        searchTargets: ['name', 'namespace_id'],
    },
    cost: {},
    unifiedCost: {},
};
