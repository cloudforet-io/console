export const CLOUD_SERVICE_PAGE_URL_QUERY_KEY = ['provider', 'service', 'region', 'project', 'service_account', 'period', 'filters'] as const;

export const CLOUD_SERVICE_CATEGORY = Object.freeze({
    SERVER: 'Server',
    COMPUTE: 'Compute',
    CONTAINER: 'Container',
    DATABASE: 'Database',
    NETWORKING: 'Networking',
    STORAGE: 'Storage',
    SECURITY: 'Security',
    ANALYTICS: 'Analytics',
    APPLICATION_INTEGRATION: 'Application Integration',
    MANAGEMENT: 'Management',
} as const);

export const CLOUD_SERVICE_FILTER_KEY = Object.freeze({
    PROJECT: 'project_id',
    SERVICE_ACCOUNT: 'service_account_id',
    SERVICE_CATEGORY: 'labels',
    REGION: 'region_code',
} as const);
