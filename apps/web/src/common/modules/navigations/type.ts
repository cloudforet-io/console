export const RECENT_TYPE = {
    SERVICE: 'SERVICE',
    SERVICE_ACCOUNT: 'SERVICE_ACCOUNT',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
    DASHBOARD: 'DASHBOARD',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    COST_ANALYSIS: 'COST_ANALYSIS',
} as const;
export type RecentType = typeof RECENT_TYPE[keyof typeof RECENT_TYPE];
export const recentNSearchTabMap = {
    service: RECENT_TYPE.SERVICE,
    serviceAccount: RECENT_TYPE.SERVICE_ACCOUNT,
    project: RECENT_TYPE.PROJECT,
    projectGroup: RECENT_TYPE.PROJECT_GROUP,
    dashboard: RECENT_TYPE.DASHBOARD,
    cloudService: RECENT_TYPE.CLOUD_SERVICE,
    costAnalysis: RECENT_TYPE.COST_ANALYSIS,
} as const;

export interface RecentMenu {
    name: string;
    user_id: string;
    data: {
        id: string;
        label: string;
        type: RecentType;
        workspace_id: string;
    };
    created_at: string;
    updated_at: string;
    tags: { [key: string]: any };
    domain_id: string;
}
