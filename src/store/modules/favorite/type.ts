export const FAVORITE_TYPE = Object.freeze({
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
} as const);
export type FavoriteType = typeof FAVORITE_TYPE[keyof typeof FAVORITE_TYPE]

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
}

export interface FavoriteState {
    menuItems: FavoriteConfig[]|null;
    projectItems: FavoriteConfig[]|null;
    projectGroupItems: FavoriteConfig[]|null;
    cloudServiceItems: FavoriteConfig[]|null;
    isLoading: FavoriteHasLoaded;
}
