
export const RECENT_TYPE = Object.freeze({
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
    DASHBOARD: 'DASHBOARD',
} as const);
export type RecentType = typeof RECENT_TYPE[keyof typeof RECENT_TYPE];

export interface RecentConfig {
    itemType: RecentType;
    itemId: string;
    updatedAt?: string;
}

export interface RecentItem extends RecentConfig {
    name?: string;
    label?: string;
    icon?: string;
    provider?: string;
    parents?: { name?: string; label?: string }[];
}

export interface RecentState {
    allItems: RecentItem[];
    menuItems: RecentItem[];
    projectItems: RecentItem[];
    projectGroupItems: RecentItem[];
    cloudServiceItems: RecentItem[];
    dashboardItems: RecentItem[];
}
