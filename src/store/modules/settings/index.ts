import { SettingItem, SettingsState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

export const STORAGE_KEY = 'store/settings';

let storedSettingsState: SettingItem = {};

try {
    storedSettingsState = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
} catch (e) {
    window.localStorage.removeItem(STORAGE_KEY);
}

const state: SettingsState = {
    items: storedSettingsState.items || {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
