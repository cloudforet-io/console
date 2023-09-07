import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { FavoriteConfig, FavoriteState, FavoriteType } from '@/store/modules/favorite/type';
import {
    FAVORITE_TYPE,
} from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

const createFavorite = async (itemType: FavoriteType, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.create({
            type: itemType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const deleteFavorite = async (itemType: FavoriteType, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.delete({
            type: itemType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const addCommitsByItemType = {
    [FAVORITE_TYPE.PROJECT]: 'addProjectItem',
    [FAVORITE_TYPE.PROJECT_GROUP]: 'addProjectGroupItem',
    [FAVORITE_TYPE.CLOUD_SERVICE]: 'addCloudServiceItem',
    [FAVORITE_TYPE.DASHBOARD]: 'addDashboardItem',
    [FAVORITE_TYPE.COST_ANALYSIS]: 'addCostAnalysisItem',
    [FAVORITE_TYPE.MENU]: 'addMenuItem',
};
export const addItem: Action<FavoriteState, any> = async ({ commit }, favorite: FavoriteConfig): Promise<void> => {
    const itemType = favorite.itemType;
    const itemId = favorite.itemId;
    await createFavorite(itemType, itemId);
    commit(addCommitsByItemType[itemType], favorite);
};

const removeCommitsByItemType = {
    [FAVORITE_TYPE.PROJECT]: 'removeProjectItem',
    [FAVORITE_TYPE.PROJECT_GROUP]: 'removeProjectGroupItem',
    [FAVORITE_TYPE.CLOUD_SERVICE]: 'removeCloudServiceItem',
    [FAVORITE_TYPE.DASHBOARD]: 'removeDashboardItem',
    [FAVORITE_TYPE.COST_ANALYSIS]: 'removeCostAnalysisItem',
    [FAVORITE_TYPE.MENU]: 'removeMenuItem',
};
export const removeItem: Action<FavoriteState, any> = async ({ commit }, favorite: FavoriteConfig): Promise<void> => {
    const itemType = favorite.itemType;
    const itemId = favorite.itemId;
    await deleteFavorite(itemType, itemId);
    commit(removeCommitsByItemType[itemType], favorite);
};

const favoriteItemsByItemType = {
    [FAVORITE_TYPE.MENU]: 'menuItems',
    [FAVORITE_TYPE.PROJECT]: 'projectItems',
    [FAVORITE_TYPE.PROJECT_GROUP]: 'projectGroupItems',
    [FAVORITE_TYPE.CLOUD_SERVICE]: 'cloudServiceItems',
    [FAVORITE_TYPE.COST_ANALYSIS]: 'costAnalysisItems',
    [FAVORITE_TYPE.DASHBOARD]: 'dashboardItems',
};
const setCommitsByItemType = {
    [FAVORITE_TYPE.PROJECT]: 'setProjectItems',
    [FAVORITE_TYPE.PROJECT_GROUP]: 'setProjectGroupItems',
    [FAVORITE_TYPE.CLOUD_SERVICE]: 'setCloudServiceItems',
    [FAVORITE_TYPE.MENU]: 'setMenuItems',
    [FAVORITE_TYPE.COST_ANALYSIS]: 'setCostAnalysisItems',
    [FAVORITE_TYPE.DASHBOARD]: 'setDashboardItems',
};
export const load: Action<FavoriteState, any> = async ({ state, commit }, itemType: FavoriteType): Promise<void|Error> => {
    const stateName = favoriteItemsByItemType[itemType];
    if (!stateName) return;

    // early return if favorite items are already loaded
    if (Array.isArray(state[stateName])) return;

    // early return if it's being loaded
    if (state.isLoading[itemType]) return;
    commit('setIsLoading', { ...state.isLoading, [itemType]: true });
    try {
        const { results } = await SpaceConnector.client.addOns.favorite.list({
            type: itemType,
        });
        const favorites: FavoriteConfig[] = results.map((d) => ({
            itemType: d.data.type,
            itemId: d.data.id,
        }));
        commit(setCommitsByItemType[itemType], favorites);
    } catch (e) {
        commit(setCommitsByItemType[itemType], []);
        ErrorHandler.handleError(e);
    } finally {
        commit('setIsLoading', { ...state.isLoading, [itemType]: false });
    }
};
