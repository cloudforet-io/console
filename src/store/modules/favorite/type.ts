export interface FavoriteItem {
    id: string;
    resourceType: string;
    name: string;
}

export interface FavoriteState {
    items: Array<FavoriteItem>;
}
