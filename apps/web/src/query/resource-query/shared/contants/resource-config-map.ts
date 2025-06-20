export const RESOURCE_CONFIG_MAP = {
    project: {
        name: 'Project',
        resourceKey: 'project',
        idKey: 'project_id',
        nameKey: 'name',
    },
    projectGroup: {
        name: 'Project Group',
        resourceKey: 'projectGroup',
        idKey: 'project_group_id',
        nameKey: 'name',
    },
    app: {
        name: 'App',
        resourceKey: 'app',
        idKey: 'app_id',
        nameKey: 'name',
    },
    cloudServiceType: {
        name: 'Cloud Service Type',
        resourceKey: 'cloudServiceType',
        idKey: 'cloud_service_type_id',
        nameKey: 'name',
    },
    cloudServiceQuerySet: {
        name: 'Cloud Service Query Set',
        resourceKey: 'cloudServiceQuerySet',
        idKey: 'query_set_id',
        nameKey: 'name',
    },
    collector: {
        name: 'Collector',
        resourceKey: 'collector',
        idKey: 'collector_id',
        nameKey: 'name',
    },
    costDataSource: {
        name: 'Cost Data Source',
        resourceKey: 'costDataSource',
        idKey: 'data_source_id',
        nameKey: 'name',
    },
    role: {
        name: 'Role',
        resourceKey: 'role',
        idKey: 'role_id',
        nameKey: 'name',
    },
    serviceAccount: {
        name: 'Service Account',
        resourceKey: 'serviceAccount',
        idKey: 'service_account_id',
        nameKey: 'name',
    },
    workspace: {
        name: 'Workspace',
        resourceKey: 'workspace',
        idKey: 'workspace_id',
        nameKey: 'name',
    },
    workspaceGroup: {
        name: 'Workspace Group',
        resourceKey: 'workspace_group',
        idKey: 'workspace_group_id',
        nameKey: 'name',
    },
    user: {
        name: 'User',
        resourceKey: 'user',
        idKey: 'user_id',
        nameKey: 'name',
    },
    // user
    metric: {
        name: 'Metric',
        resourceKey: 'metric',
        idKey: 'metric_id',
        nameKey: 'name',
    },
} as const;
