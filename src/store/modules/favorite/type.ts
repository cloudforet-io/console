export interface FavoriteItem {
    id: string;
    resourceType: string;
    name?: string;
    label?: string;
    icon?: string;
}


export interface FavoriteState {
    items: Array<FavoriteItem>;
}
