import { FavoriteItem, FavoriteState } from '@/store/modules/favorite/type';
import { Getter } from 'vuex';

export const items: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.items.map((d) => {
    const resource = rootState.resource.project.items[d.id];
    return {
        ...d,
        name: resource?.name || d.name,
        label: resource?.label || d.name,
    };
});

export const itemMap: Getter<FavoriteState, {}> = (state: FavoriteState, getters): Record<string, FavoriteItem> => {
    const res = {};
    getters.items.forEach((d) => { res[d.id] = d; });
    return res;
};
