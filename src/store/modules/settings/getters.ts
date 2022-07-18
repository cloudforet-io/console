import type { SettingsState } from './type';

export const getItem = (state: SettingsState): any => {
    const items = state.items;
    return (key: string, path = '/') => items[`${path}:${key}`];
};
