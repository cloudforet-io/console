import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { FavoriteItem } from '@/store/modules/favorite/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


const createFavorite = async (resourceType: string, resourceId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.create({
            resource_type: resourceType,
            resource_id: resourceId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const deleteFavorite = async (resourceType: string, resourceId: string) => {
    try {
        await SpaceConnector.client.addOns.favorite.delete({
            resource_type: resourceType,
            resource_id: resourceId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const getExistItem = (state, resourceType, resourceId): boolean => {
    let items: FavoriteItem[] = [];
    if (resourceType === 'identity.Project') items = state.projectItems;
    else if (resourceType === 'identity.ProjectGroup') items = state.projectGroupItems;
    else if (resourceType === 'inventory.CloudServiceType') items = state.cloudServiceTypeItems;
    const existItem = items.find(item => item.resourceId === resourceId);
    return !!existItem;
};


export const addItem = async ({ commit, state }, favoriteItem: FavoriteItem): Promise<void> => {
    const resourceType = favoriteItem.resourceType;
    const resourceId = favoriteItem.resourceId;
    const isExists = getExistItem(state, resourceType, resourceId);
    if (!isExists) {
        await createFavorite(resourceType, resourceId);
        if (resourceType === 'identity.Project') {
            commit('addProjectItem', favoriteItem);
        } else if (resourceType === 'identity.ProjectGroup') {
            commit('addProjectGroupItem', favoriteItem);
        } else if (resourceType === 'inventory.CloudServiceType') {
            commit('addCloudServiceTypeItem', favoriteItem);
        }
    }
};

export const removeItem = async ({ commit, state }, favoriteItem: FavoriteItem): Promise<void> => {
    const resourceType = favoriteItem.resourceType;
    const resourceId = favoriteItem.resourceId;
    const isExists = getExistItem(state, resourceType, resourceId);
    if (isExists) {
        await deleteFavorite(resourceType, resourceId);
        if (resourceType === 'identity.Project') {
            commit('removeProjectItem', favoriteItem);
        } else if (resourceType === 'identity.ProjectGroup') {
            commit('removeProjectGroupItem', favoriteItem);
        } else if (resourceType === 'inventory.CloudServiceType') {
            commit('removeCloudServiceTypeItem', favoriteItem);
        }
    }
};

export const load = async ({ commit }, resourceType: string): Promise<void|Error> => {
    const { results } = await SpaceConnector.client.addOns.favorite.list({
        resource_type: resourceType,
    });
    const favoriteItems: FavoriteItem[] = results.map(d => ({
        resourceType: d.data.resource_type,
        resourceId: d.data.resource_id,
    }));

    if (resourceType === 'identity.Project') {
        commit('loadProjectItem', favoriteItems);
    } else if (resourceType === 'identity.ProjectGroup') {
        commit('loadProjectGroupItem', favoriteItems);
    } else if (resourceType === 'inventory.CloudServiceType') {
        commit('loadCloudServiceTypeItem', favoriteItems);
    }
};
