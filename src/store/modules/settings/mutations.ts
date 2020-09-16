import { SetItemRequest, SettingsState } from './type';

export const setItem = (state: SettingsState, item: SetItemRequest): void => {
    const itemKey = `${item.page}:${item.key}`;
    state.items[itemKey] = item.value;
};
