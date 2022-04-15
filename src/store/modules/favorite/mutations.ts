import { FavoriteState, FavoriteItem } from '@/store/modules/favorite/type';


/* Project */
export const addProjectItem = (state: FavoriteState, favoriteItem: FavoriteItem): void => {
    state.projectItems.unshift(favoriteItem);
};
export const removeProjectItem = (state: FavoriteState, favoriteItem: Partial<FavoriteItem>): void => {
    state.projectItems = state.projectItems.filter(d => d.resourceId !== favoriteItem.resourceId);
};
export const loadProjectItem = (state: FavoriteState, favoriteItems: FavoriteItem[]): void => {
    state.projectItems = favoriteItems;
};


/* Project Group */
export const addProjectGroupItem = (state: FavoriteState, favoriteItem: FavoriteItem): void => {
    state.projectGroupItems.unshift(favoriteItem);
};
export const removeProjectGroupItem = (state: FavoriteState, favoriteItem: Partial<FavoriteItem>): void => {
    state.projectGroupItems = state.projectGroupItems.filter(d => d.resourceId !== favoriteItem.resourceId);
};
export const loadProjectGroupItem = (state: FavoriteState, favoriteItems: FavoriteItem[]): void => {
    state.projectGroupItems = favoriteItems;
};


/* Cloud Service Type */
export const addCloudServiceTypeItem = (state: FavoriteState, favoriteItem: FavoriteItem): void => {
    state.cloudServiceTypeItems.unshift(favoriteItem);
};
export const removeCloudServiceTypeItem = (state: FavoriteState, favoriteItem: Partial<FavoriteItem>): void => {
    state.cloudServiceTypeItems = state.cloudServiceTypeItems.filter(d => d.resourceId !== favoriteItem.resourceId);
};
export const loadCloudServiceTypeItem = (state: FavoriteState, favoriteItems: FavoriteItem[]): void => {
    state.cloudServiceTypeItems = favoriteItems;
};
