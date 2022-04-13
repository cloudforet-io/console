export interface FavoriteItem {
    resourceType: string;
    resourceId: string;
    name?: string;
    label?: string;
    icon?: string;
}


export interface FavoriteState {
    projectItems: FavoriteItem[];
    projectGroupItems: FavoriteItem[];
    cloudServiceTypeItems: FavoriteItem[];
}
