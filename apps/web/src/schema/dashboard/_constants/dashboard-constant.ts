export const REFRESH_INTERVAL_OPTIONS_MAP = {
    off: 0,
    '15s': 15000,
    '30s': 30000,
    '1m': 60000,
    '5m': 300000,
    '10m': 600000,
    '30m': 1800000,
    '1h': 3600000,
} as const;

export const DASHBOARD_LABEL = {
    COST: 'Cost',
    ASSET: 'Asset',
    COMPLIANCE: 'Compliance',
    SECURITY: 'Security',
    BLANK: 'Blank',
} as const;

export const DASHBOARD_TYPE = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const;
