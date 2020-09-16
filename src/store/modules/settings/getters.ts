import { SettingsState } from './type';

export const getItem = (state: SettingsState): any => (page: string, key: string) => {
    const itemKey = `${page}:${key}`;
    return state.items[itemKey];
};
