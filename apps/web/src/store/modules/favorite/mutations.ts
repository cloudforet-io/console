import type { Mutation } from 'vuex';

import type { FavoriteState, FavoriteConfig, FavoriteHasLoaded } from '@/store/modules/favorite/type';

export const setIsLoading: Mutation<FavoriteState> = (state, isLoading: FavoriteHasLoaded): void => {
    state.isLoading = isLoading;
};

/* Menu */
export const addMenuItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    if (state.menuItems) state.menuItems.unshift(favorite);
};
export const removeMenuItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.menuItems = state.menuItems?.filter((d) => d.itemId !== favorite.itemId) ?? null;
};
export const setMenuItems = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.menuItems = favorite;
};

/* Project */
export const addProjectItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    if (state.projectItems) state.projectItems.unshift(favorite);
};
export const removeProjectItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.projectItems = state.projectItems?.filter((d) => d.itemId !== favorite.itemId) ?? null;
};
export const setProjectItems = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.projectItems = favorite;
};

/* Project Group */
export const addProjectGroupItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    if (state.projectGroupItems) state.projectGroupItems.unshift(favorite);
};
export const removeProjectGroupItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.projectGroupItems = state.projectGroupItems?.filter((d) => d.itemId !== favorite.itemId) ?? null;
};
export const setProjectGroupItems = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.projectGroupItems = favorite;
};

/* Cloud Service Type */
export const addCloudServiceItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    if (state.cloudServiceItems) state.cloudServiceItems.unshift(favorite);
};
export const removeCloudServiceItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.cloudServiceItems = state.cloudServiceItems?.filter((d) => d.itemId !== favorite.itemId) ?? null;
};
export const setCloudServiceItems = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.cloudServiceItems = favorite;
};

/* Dashboard Type */
export const addDashboardItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    if (state.dashboardItems) state.dashboardItems.unshift(favorite);
};
export const removeDashboardItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.dashboardItems = state.dashboardItems?.filter((d) => d.itemId !== favorite.itemId) ?? null;
};
export const setDashboardItems = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.dashboardItems = favorite;
};

/* CostAnalysis Type */
export const addCostAnalysisItem = (state: FavoriteState, favorite: FavoriteConfig): void => {
    if (state.costAnalysisItems) state.costAnalysisItems.unshift(favorite);
};
export const removeCostAnalysisItem = (state: FavoriteState, favorite: Partial<FavoriteConfig>): void => {
    state.costAnalysisItems = state.costAnalysisItems?.filter((d) => d.itemId !== favorite.itemId) ?? null;
};
export const setCostAnalysisItems = (state: FavoriteState, favorite: FavoriteConfig[]): void => {
    state.costAnalysisItems = favorite;
};
