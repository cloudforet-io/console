export const refreshInterval = ['off', '15s', '30s', '1m', '5m', '10m', '30m', '1h'];

export type RefreshInterval = typeof refreshInterval[number];


export const GRANULARITY = {
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;
