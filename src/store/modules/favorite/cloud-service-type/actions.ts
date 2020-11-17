import { SpaceConnector, QueryHelper } from '@/lib/space-connector';
import { FavoriteState, FavoriteItem } from '@/store/modules/favorite/type';

const FAVORITE_TYPE = 'cloud-service-type';

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

export const load = async ({ commit, state, rootState }): Promise<void|Error> => {
    const queryHelper = new QueryHelper() as QueryHelper;
    queryHelper.setFilter({
        k: 'name',
        v: `console:${rootState.user.userType}:${rootState.user.userId}:favorite:${FAVORITE_TYPE}`,
        o: 'contain',
    }).setOnly('data');

    const response = await SpaceConnector.client.config.userConfig.list({ query: queryHelper.data });
    commit('loadItem', response.results.map(config => config.data));
};
