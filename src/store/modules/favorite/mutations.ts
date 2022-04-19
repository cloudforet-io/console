import { FavoriteState, FavoriteConfig } from '@/store/modules/favorite/type';


/* Menu */
export const addMenuItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    state.menuItems.unshift(favorite);
};
export const removeMenuItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.menuItems = state.menuItems.filter(d => d.itemId !== favorite.itemId);
};
export const loadMenuItem = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.menuItems = favorite;
};

/* Project */
export const addProjectItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    state.projectItems.unshift(favorite);
};
export const removeProjectItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.projectItems = state.projectItems.filter(d => d.itemId !== favorite.itemId);
};
export const loadProjectItem = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.projectItems = favorite;
};


/* Project Group */
export const addProjectGroupItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    state.projectGroupItems.unshift(favorite);
};
export const removeProjectGroupItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.projectGroupItems = state.projectGroupItems.filter(d => d.itemId !== favorite.itemId);
};
export const loadProjectGroupItem = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.projectGroupItems = favorite;
};


/* Cloud Service Type */
export const addCloudServiceTypeItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    state.cloudServiceTypeItems.unshift(favorite);
};
export const removeCloudServiceTypeItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.cloudServiceTypeItems = state.cloudServiceTypeItems.filter(d => d.itemId !== favorite.itemId);
};
export const loadCloudServiceTypeItem = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.cloudServiceTypeItems = favorite;
};
