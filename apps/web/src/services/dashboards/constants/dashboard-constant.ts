export const DASHBOARD_LABEL = {
    COST: 'Cost',
    ASSET: 'Asset',
    COMPLIANCE: 'Compliance',
    SECURITY: 'Security',
    BLANK: 'Blank',
} as const;
export type DashboardLabel = typeof DASHBOARD_LABEL[keyof typeof DASHBOARD_LABEL];
