import { FavoriteState, FavoriteItem } from '@/store/modules/favorite/type';

export const addItem = (state: FavoriteState, favoriteItem: FavoriteItem): void => {
    state.items.push(favoriteItem);
};

export const removeItem = (state: FavoriteState, favoriteItem: Partial<FavoriteItem>): void => {
    state.items = state.items.filter((item: Partial<FavoriteItem>) => item.id !== favoriteItem.id);
};

export const loadItem = (state: FavoriteState, items: FavoriteItem[]): void => {
    state.items = items;
};
