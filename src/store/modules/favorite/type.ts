export const FAVORITE_TYPE = Object.freeze({
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
} as const);
export type FAVORITE_TYPE = typeof FAVORITE_TYPE[keyof typeof FAVORITE_TYPE]

export interface FavoriteConfig {
    favoriteType: FAVORITE_TYPE;
    itemId: string;
}

interface ParentItem {
    name: string;
    label: string;
}
export interface FavoriteItem extends FavoriteConfig {
    name?: string;
    label?: string;
    icon?: string;
    image?: string;
    parents?: ParentItem[];
}


export interface FavoriteState {
    menuItems: FavoriteConfig[];
    projectItems: FavoriteConfig[];
    projectGroupItems: FavoriteConfig[];
    cloudServiceTypeItems: FavoriteConfig[];
}
