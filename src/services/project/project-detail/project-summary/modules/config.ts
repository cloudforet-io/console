export const SERVICE_CATEGORY = {
    SERVER: 'Server',
    CONTAINER: 'Container',
    DATABASE: 'Database',
    NETWORKING: 'Networking',
    STORAGE: 'Storage',
    SECURITY: 'Security',
    ANALYTICS: 'Analytics',
    ALL: 'All',
} as const;

export type ServiceCategory = typeof SERVICE_CATEGORY[keyof typeof SERVICE_CATEGORY];

export const DATE_TYPE = {
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
} as const;
export type DateType = typeof DATE_TYPE[keyof typeof DATE_TYPE];
