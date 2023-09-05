export const REFERENCE_TYPE_INFO = {
    project_group: {
        type: 'project_group',
        key: 'project_group_id',
        name: 'Project Group',
    },
    project: {
        type: 'project',
        key: 'project_id',
        name: 'Project',
    },
    protocol: {
        type: 'protocol',
        key: 'protocol_id',
        name: 'Protocol',
    },
    cloud_service_type: {
        type: 'cloud_service_type',
        key: 'cloud_service_type',
        name: 'Cloud Service Type',
    },
    collector: {
        type: 'collector',
        key: 'collector_id',
        name: 'Collector',
    },
    plugin: {
        type: 'plugin',
        key: 'plugin_id',
        name: 'Plugin',
    },
    provider: {
        type: 'provider',
        key: 'provider',
        name: 'Provider',
    },
    region: {
        type: 'region',
        key: 'region_code',
        name: 'Region',
    },
    secret: {
        type: 'secret',
        key: 'secret_id',
        name: 'Secret',
    },
    service_account: {
        type: 'service_account',
        key: 'service_account_id',
        name: 'Service Account',
    },
    user: {
        type: 'user',
        key: 'user_id',
        name: 'User',
    },
    webhook: {
        type: 'webhook',
        key: 'webhook_id',
        name: 'Webhook',
    },
    cost_data_source: {
        type: 'cost_data_source',
        key: 'data_source_id',
        name: 'Data Source',
        resourceType: 'cost_analysis.DataSource',
    },
} as const;
