import type { SettingsState, SetItemRequest } from './type';

export const setItem = (state: SettingsState, item: SetItemRequest): void => {
    if (!item.path) {
        item.path = '/';
    }

    state.items = {
        ...state.items,
        [`${item.path}:${item.key}`]: item.value,
    };
};
