import type { SettingsState } from './type';

export const getItem = (state: SettingsState): any => (key: string, path = '') => {
    if (!path.length) return state.user[key];
    return state.user[`${path}:${key}`];
};
