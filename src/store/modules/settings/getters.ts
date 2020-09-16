import { SettingsState } from './type';

export const getItem = (state: SettingsState): any => (key: string, path = '/') => {
    return state.items[`${path}:${key}`];
};
