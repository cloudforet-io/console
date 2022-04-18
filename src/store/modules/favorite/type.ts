export const FAVORITE_TYPE = Object.freeze({
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
} as const);
export type FAVORITE_TYPE = typeof FAVORITE_TYPE[keyof typeof FAVORITE_TYPE]

export interface FavoriteItem {
    favoriteType: FAVORITE_TYPE;
    itemId: string;
    name?: string;
    label?: string;
    icon?: string;
}


export interface FavoriteState {
    menuItems: FavoriteItem[];
    projectItems: FavoriteItem[];
    projectGroupItems: FavoriteItem[];
    cloudServiceTypeItems: FavoriteItem[];
}
