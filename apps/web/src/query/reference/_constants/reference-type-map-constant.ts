export const REFERENCE_TYPE_INFO_MAP = {
    app: {
        type: 'app',
        key: 'app_id',
        name: 'App',
    },
    cloudServiceType: {
        type: 'cloud_service_type',
        key: 'cloud_service_type_id',
        name: 'Cloud Service Type',
    },
    cloudServiceQuerySet: {
        type: 'cloud_service_query_set',
        key: 'query_set_id',
        name: 'Cloud Service Query Set',
    },
    collector: {
        type: 'collector',
        key: 'collector_id',
        name: 'Collector',
    },
    costDataSource: {
        type: 'cost_data_source',
        key: 'data_source_id',
        name: 'Cost Data Source',
    },
    escalationPolicy: {
        type: 'escalation_policy',
        key: 'escalation_policy_id',
        name: 'Escalation Policy',
    },
    metric: {
        type: 'metric',
        key: 'metric_id',
        name: 'Metric',
    },
    namespace: {
        type: 'namespace',
        key: 'namespace_id',
        name: 'Namespace',
    },
    plugin: {
        type: 'plugin',
        key: 'plugin_id',
        name: 'Plugin',
    },
    projectGroup: {
        type: 'project_group',
        key: 'project_group_id',
        name: 'Project Group',
    },
    project: {
        type: 'project',
        key: 'project_id',
        name: 'Project',
    },
    publicDashboard: {
        type: 'public_dashboard',
        key: 'dashboard_id',
        name: 'Public Dashboard',
    },
    publicFolder: {
        type: 'public_folder',
        key: 'folder_id',
        name: 'Public Folder',
    },
    region: {
        type: 'region',
        key: 'region_code',
        name: 'Region',
    },
    role: {
        type: 'role',
        key: 'role_id',
        name: 'Role',
    },
    secret: {
        type: 'secret',
        key: 'secret_id',
        name: 'Secret',
    },
    serviceAccount: {
        type: 'service_account',
        key: 'service_account_id',
        name: 'Service Account',
    },
    service: {
        type: 'service',
        key: 'service_id',
        name: 'Service',
    },
    trustedAccount: {
        type: 'trusted_account',
        key: 'trusted_account_id',
        name: 'name',
    },
    userGroup: {
        type: 'user_group',
        key: 'user_group_id',
        name: 'User Group',
    },
    workspace: {
        type: 'workspace',
        key: 'workspace_id',
        name: 'Workspace',
    },
} as const;
