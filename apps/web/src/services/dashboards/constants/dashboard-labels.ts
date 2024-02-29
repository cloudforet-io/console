export const DASHBOARD_PROVIDER_LABELS = {
    AWS: 'AWS',
    AZURE: 'Azure',
    GOOGLE: 'Google',
};

export const DASHBOARD_SERVICE_LABELS = {
    COST: 'Cost',
    CDN: 'CDN',
    TRAFFIC: 'Traffic',
    SECURITY: 'Security',
    // PROWLER: 'Prowler',
    // CSPM: 'CSPM',
};

export const DASHBOARD_LABELS = {
    ...DASHBOARD_PROVIDER_LABELS,
    ...DASHBOARD_SERVICE_LABELS,
};
