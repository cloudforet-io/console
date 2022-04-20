import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { FAVORITE_TYPE, FavoriteConfig, FavoriteState } from '@/store/modules/favorite/type';
import { Action } from 'vuex';


const createFavorite = async (itemType: FAVORITE_TYPE, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.create({
            type: itemType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const deleteFavorite = async (itemType: FAVORITE_TYPE, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.delete({
            type: itemType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const addItem: Action<FavoriteState, any> = async ({ commit }, favorite: FavoriteConfig): Promise<void> => {
    const itemType = favorite.itemType;
    const itemId = favorite.itemId;
    await createFavorite(itemType, itemId);
    const favoriteCommitsByItemType = {
        [FAVORITE_TYPE.PROJECT]: 'addProjectItem',
        [FAVORITE_TYPE.PROJECT_GROUP]: 'addProjectGroupItem',
        [FAVORITE_TYPE.CLOUD_SERVICE]: 'addCloudServiceItem',
        [FAVORITE_TYPE.MENU]: 'addMenuItem',
    };
    commit(favoriteCommitsByItemType[itemType], favorite);
};

export const removeItem: Action<FavoriteState, any> = async ({ commit }, favorite: FavoriteConfig): Promise<void> => {
    const itemType = favorite.itemType;
    const itemId = favorite.itemId;
    await deleteFavorite(itemType, itemId);
    const favoriteCommitsByItemType = {
        [FAVORITE_TYPE.PROJECT]: 'removeProjectItem',
        [FAVORITE_TYPE.PROJECT_GROUP]: 'removeProjectGroupItem',
        [FAVORITE_TYPE.CLOUD_SERVICE]: 'removeCloudServiceItem',
        [FAVORITE_TYPE.MENU]: 'removeMenuItem',
    };
    commit(favoriteCommitsByItemType[itemType], favorite);
};

export const load: Action<FavoriteState, any> = async ({ commit }, itemType: FAVORITE_TYPE): Promise<void|Error> => {
    const { results } = await SpaceConnector.client.addOns.favorite.list({
        type: itemType,
    });
    const favorites: FavoriteConfig[] = results.map(d => ({
        itemType: d.data.type,
        itemId: d.data.id,
    }));
    const favoriteCommitsByItemType = {
        [FAVORITE_TYPE.PROJECT]: 'loadProjectItem',
        [FAVORITE_TYPE.PROJECT_GROUP]: 'loadProjectGroupItem',
        [FAVORITE_TYPE.CLOUD_SERVICE]: 'loadCloudServiceItem',
        [FAVORITE_TYPE.MENU]: 'loadMenuItem',
    };
    commit(favoriteCommitsByItemType[itemType], favorites);
};
