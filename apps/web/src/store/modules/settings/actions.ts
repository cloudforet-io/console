import type { SetItemRequest } from './type';

export const setItem = ({ commit }, item: SetItemRequest): void => {
    commit('setItem', item);
};
