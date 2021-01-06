import { SettingsState } from './type';

export const getItem = (state: SettingsState): any => (key: string, path = '/') => state.items[`${path}:${key}`];
