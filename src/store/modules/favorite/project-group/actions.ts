import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { FavoriteItem } from '@/store/modules/favorite/type';

const FAVORITE_TYPE = 'project-group';

const createUserConfig = async (userType: string, userId: string, favoriteItem: FavoriteItem): Promise<void|Error> => {
    await SpaceConnector.client.config.userConfig.create(
        {
            name: `console:${userType}:${userId}:favorite:${FAVORITE_TYPE}:${favoriteItem.id}`,
            data: favoriteItem,
        },
    );
};

const deleteUserConfig = async (userType: string, userId: string, favoriteItem: Partial<FavoriteItem>): Promise<void|Error> => {
    await SpaceConnector.client.config.userConfig.delete(
        {
            name: `console:${userType}:${userId}:favorite:${FAVORITE_TYPE}:${favoriteItem.id}`,
        },
    );
};

export const addItem = async ({ commit, state, rootState }, favoriteItem: FavoriteItem): Promise<void> => {
    const isExists = state.items.find((item: FavoriteItem) => item.id === favoriteItem.id);

    if (!isExists) {
        await createUserConfig(rootState.user.userType, rootState.user.userId, favoriteItem);
        commit('addItem', favoriteItem);
    }
};

export const removeItem = async ({ commit, state, rootState }, favoriteItem: Partial<FavoriteItem>): Promise<void> => {
    const isExists = state.items.find((item: FavoriteItem) => item.id === favoriteItem.id);

    if (isExists) {
        await deleteUserConfig(rootState.user.userType, rootState.user.userId, favoriteItem);
        commit('removeItem', favoriteItem);
    }
};

export const load = async ({ commit, rootState }): Promise<void|Error> => {
    const response = await SpaceConnector.client.config.userConfig.list({
        query: {
            filter: [{
                k: 'name',
                v: `console:${rootState.user.userType}:${rootState.user.userId}:favorite:${FAVORITE_TYPE}:`,
                o: 'contain',
            }],
            only: ['data'],
        },
    });
    commit('loadItem', response.results.map(config => config.data));
};
