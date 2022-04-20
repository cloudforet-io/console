export const RECENT_TYPE = Object.freeze({
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
} as const);
export type RECENT_TYPE = typeof RECENT_TYPE[keyof typeof RECENT_TYPE]

export interface RecentConfig {
    itemType: RECENT_TYPE;
    itemId: string;
}

interface Parent {
    name?: string;
    label?: string;
}
export interface RecentItem extends RecentConfig {
    name?: string;
    label?: string;
    icon?: string;
    provider?: string;
    parents?: Parent[];
}


export interface RecentState {
    menuItems: RecentItem[];
    projectItems: RecentItem[];
    projectGroupItems: RecentItem[];
    cloudServiceItems: RecentItem[];
}
