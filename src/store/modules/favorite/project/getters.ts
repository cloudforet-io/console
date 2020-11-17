import { FavoriteItem, FavoriteState } from '@/store/modules/favorite/type';
import { Getter } from 'vuex';
import { sortBy } from 'lodash';


export const items: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.items.map((d) => {
    const resource = rootState.resource.project.items[d.id];
    return {
        ...d,
        name: resource?.name || d.name || d.id,
        label: resource?.label || d.name || d.id,
    };
});

export const itemMap: Getter<FavoriteState, {}> = (state: FavoriteState, getters): Record<string, FavoriteItem> => {
    const res = {};
    getters.items.forEach((d) => { res[d.id] = d; });
    return res;
};

export const sortedItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => sortBy(
    getters.items, d => d.name,
);
