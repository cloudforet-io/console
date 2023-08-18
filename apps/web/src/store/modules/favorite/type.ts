
export const FAVORITE_TYPE = {
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
    DASHBOARD: 'DASHBOARD',
} as const;
export type FavoriteType = typeof FAVORITE_TYPE[keyof typeof FAVORITE_TYPE];

export interface FavoriteConfig {
    itemType: FavoriteType;
    itemId: string;
}

export interface FavoriteItem extends FavoriteConfig {
    name?: string;
    label?: string;
    icon?: string;
    provider?: string;
    parents?: { name?: string; label?: string }[];
}

export interface FavoriteHasLoaded {
    [FAVORITE_TYPE.MENU]: boolean;
    [FAVORITE_TYPE.CLOUD_SERVICE]: boolean;
    [FAVORITE_TYPE.PROJECT]: boolean;
    [FAVORITE_TYPE.PROJECT_GROUP]: boolean;
    [FAVORITE_TYPE.DASHBOARD]: boolean;
}

export interface FavoriteState {
    menuItems: FavoriteConfig[]|null;
    projectItems: FavoriteConfig[]|null;
    projectGroupItems: FavoriteConfig[]|null;
    cloudServiceItems: FavoriteConfig[]|null;
    dashboardItems: FavoriteConfig[]|null;
    isLoading: FavoriteHasLoaded;
}

export const FAVORITE_TYPE_TO_STATE_NAME = {
    [FAVORITE_TYPE.MENU]: 'menuItems',
    [FAVORITE_TYPE.PROJECT]: 'projectItems',
    [FAVORITE_TYPE.PROJECT_GROUP]: 'projectGroupItems',
    [FAVORITE_TYPE.CLOUD_SERVICE]: 'cloudServiceItems',
    [FAVORITE_TYPE.DASHBOARD]: 'dashboardItems',
};
