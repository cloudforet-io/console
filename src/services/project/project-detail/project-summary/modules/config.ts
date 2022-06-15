export const SERVICE_CATEGORY = Object.freeze({
    SERVER: 'server',
    CONTAINER: 'container',
    DATABASE: 'database',
    NETWORKING: 'networking',
    STORAGE: 'storage',
    SECURITY: 'security',
    ANALYTICS: 'analytics',
    ALL: 'all',
} as const);

export type ServiceCategory = typeof SERVICE_CATEGORY[keyof typeof SERVICE_CATEGORY];

export const CLOUD_SERVICE_LABEL = Object.freeze({
    [SERVICE_CATEGORY.SERVER]: 'Server',
    [SERVICE_CATEGORY.CONTAINER]: 'Container',
    [SERVICE_CATEGORY.DATABASE]: 'Database',
    [SERVICE_CATEGORY.NETWORKING]: 'Networking',
    [SERVICE_CATEGORY.STORAGE]: 'Storage',
    [SERVICE_CATEGORY.SECURITY]: 'Security',
    [SERVICE_CATEGORY.ANALYTICS]: 'Analytics',
    [SERVICE_CATEGORY.ALL]: 'All',
});

export const DATE_TYPE = Object.freeze({
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
});
