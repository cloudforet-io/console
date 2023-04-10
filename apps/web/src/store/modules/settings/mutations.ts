import type { SettingsState, SetItemRequest } from './type';

export const setUserSetting = (state: SettingsState, { item }: {item: SetItemRequest, userId: string}): void => {
    if (!item.path) {
        state.user = {
            ...state.user,
            [item.key]: item.value,
        };
    } else {
        state.user = {
            ...state.user,
            [`${item.path}:${item.key}`]: item.value,
        };
    }
};

export const initUserSettings = (state: SettingsState, { item }: {item: SettingsState['user']}): void => {
    state.user = item;
};
