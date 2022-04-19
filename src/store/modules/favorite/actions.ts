import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { FAVORITE_TYPE, FavoriteConfig } from '@/store/modules/favorite/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


const createFavorite = async (favoriteType: FAVORITE_TYPE, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.create({
            type: favoriteType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const deleteFavorite = async (favoriteType: FAVORITE_TYPE, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.delete({
            type: favoriteType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const addItem = async ({ commit }, favorite: FavoriteConfig): Promise<void> => {
    const favoriteType = favorite.favoriteType;
    const itemId = favorite.itemId;
    await createFavorite(favoriteType, itemId);
    if (favoriteType === FAVORITE_TYPE.PROJECT) {
        commit('addProjectItem', favorite);
    } else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) {
        commit('addProjectGroupItem', favorite);
    } else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) {
        commit('addCloudServiceTypeItem', favorite);
    } else if (favoriteType === FAVORITE_TYPE.MENU) {
        commit('addMenuItem', favorite);
    }
};

export const removeItem = async ({ commit }, favorite: FavoriteConfig): Promise<void> => {
    const favoriteType = favorite.favoriteType;
    const itemId = favorite.itemId;
    await deleteFavorite(favoriteType, itemId);
    if (favoriteType === FAVORITE_TYPE.PROJECT) {
        commit('removeProjectItem', favorite);
    } else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) {
        commit('removeProjectGroupItem', favorite);
    } else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) {
        commit('removeCloudServiceTypeItem', favorite);
    } else if (favoriteType === FAVORITE_TYPE.MENU) {
        commit('removeMenuItem', favorite);
    }
};

export const load = async ({ commit }, favoriteType: FAVORITE_TYPE): Promise<void|Error> => {
    const { results } = await SpaceConnector.client.addOns.favorite.list({
        type: favoriteType,
    });
    const favorites: FavoriteConfig[] = results.map(d => ({
        favoriteType: d.data.type,
        itemId: d.data.id,
    }));

    if (favoriteType === FAVORITE_TYPE.PROJECT) {
        commit('loadProjectItem', favorites);
    } else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) {
        commit('loadProjectGroupItem', favorites);
    } else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) {
        commit('loadCloudServiceTypeItem', favorites);
    } else if (favoriteType === FAVORITE_TYPE.MENU) {
        commit('loadMenuItem', favorites);
    }
};
