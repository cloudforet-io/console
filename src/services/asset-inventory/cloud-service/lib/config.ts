export const CLOUD_SERVICE_PAGE_URL_QUERY_KEY = ['provider', 'service', 'region'] as const;
export type CLOUD_SERVICE_PAGE_URL_QUERY_KEY = typeof CLOUD_SERVICE_PAGE_URL_QUERY_KEY[number];

export const CATEGORY = Object.freeze({
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
export type CATEGORY = typeof CATEGORY[keyof typeof CATEGORY]
