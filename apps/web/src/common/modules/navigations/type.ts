import type { UserConfigModel } from '@/schema/config/user-config/model';

export const RECENT_TYPE = {
    SERVICE: 'SERVICE',
    SERVICE_ACCOUNT: 'SERVICE_ACCOUNT',
    TRUSTED_ACCOUNT: 'TRUSTED_ACCOUNT',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
    DASHBOARD: 'DASHBOARD',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    CLOUD_SERVICE_TYPE: 'CLOUD_SERVICE_TYPE',
    COST_ANALYSIS: 'COST_ANALYSIS',
    SECURITY: 'SECURITY',
    WORKSPACE: 'WORKSPACE',
} as const;
export type RecentType = typeof RECENT_TYPE[keyof typeof RECENT_TYPE];
export const recentNSearchTabMap = {
    service: RECENT_TYPE.SERVICE,
    serviceAccount: RECENT_TYPE.SERVICE_ACCOUNT,
    project: RECENT_TYPE.PROJECT,
    projectGroup: RECENT_TYPE.PROJECT_GROUP,
    dashboard: RECENT_TYPE.DASHBOARD,
    cloudService: RECENT_TYPE.CLOUD_SERVICE,
    cloudServiceType: RECENT_TYPE.CLOUD_SERVICE_TYPE,
    costAnalysis: RECENT_TYPE.COST_ANALYSIS,
} as const;

export interface RecentConfig {
    itemType: RecentType;
    workspaceId: string;
    itemId: string;
}

export type RecentItem = UserConfigModel<{
    id: string;
    label: string;
    type: RecentType;
    workspace_id: string;
    [key: string]: any;
}>;
