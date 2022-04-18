import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { FAVORITE_TYPE, FavoriteItem } from '@/store/modules/favorite/type';
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
const getExistItem = (state, favoriteType, itemId): boolean => {
    let items: FavoriteItem[] = [];
    if (favoriteType === FAVORITE_TYPE.PROJECT) items = state.projectItems;
    else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) items = state.projectGroupItems;
    else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) items = state.cloudServiceTypeItems;
    else if (favoriteType === FAVORITE_TYPE.MENU) items = state.menuItems;
    const existItem = items.find(item => item.itemId === itemId);
    return !!existItem;
};


export const addItem = async ({ commit, state }, favoriteItem: FavoriteItem): Promise<void> => {
    const favoriteType = favoriteItem.favoriteType;
    const itemId = favoriteItem.itemId;
    const isExists = getExistItem(state, favoriteType, itemId);
    if (!isExists) {
        await createFavorite(favoriteType, itemId);
        if (favoriteType === FAVORITE_TYPE.PROJECT) {
            commit('addProjectItem', favoriteItem);
        } else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) {
            commit('addProjectGroupItem', favoriteItem);
        } else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) {
            commit('addCloudServiceTypeItem', favoriteItem);
        } else if (favoriteType === FAVORITE_TYPE.MENU) {
            commit('addMenuItem', favoriteItem);
        }
    }
};

export const removeItem = async ({ commit, state }, favoriteItem: FavoriteItem): Promise<void> => {
    const favoriteType = favoriteItem.favoriteType;
    const itemId = favoriteItem.itemId;
    const isExists = getExistItem(state, favoriteType, itemId);
    if (isExists) {
        await deleteFavorite(favoriteType, itemId);
        if (favoriteType === FAVORITE_TYPE.PROJECT) {
            commit('removeProjectItem', favoriteItem);
        } else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) {
            commit('removeProjectGroupItem', favoriteItem);
        } else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) {
            commit('removeCloudServiceTypeItem', favoriteItem);
        } else if (favoriteType === FAVORITE_TYPE.MENU) {
            commit('removeMenuItem', favoriteItem);
        }
    }
};

export const load = async ({ commit }, favoriteType: FAVORITE_TYPE): Promise<void|Error> => {
    const { results } = await SpaceConnector.client.addOns.favorite.list({
        type: favoriteType,
    });
    const favoriteItems: FavoriteItem[] = results.map(d => ({
        favoriteType: d.data.type,
        itemId: d.data.id,
    }));

    if (favoriteType === FAVORITE_TYPE.PROJECT) {
        commit('loadProjectItem', favoriteItems);
    } else if (favoriteType === FAVORITE_TYPE.PROJECT_GROUP) {
        commit('loadProjectGroupItem', favoriteItems);
    } else if (favoriteType === FAVORITE_TYPE.CLOUD_SERVICE) {
        commit('loadCloudServiceTypeItem', favoriteItems);
    } else if (favoriteType === FAVORITE_TYPE.MENU) {
        commit('loadMenuItem', favoriteItems);
    }
};
