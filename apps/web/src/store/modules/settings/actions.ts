import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import type { Action } from 'vuex';


import type { SettingsState } from '@/store/modules/settings/type';

export const initSettings: Action<SettingsState, any> = ({ commit, rootState }): void => {
    const userId = rootState?.user?.userId;
    if (!LocalStorageAccessor.getItem('spaceConnector/accessToken')) return;
    try {
        const settings = LocalStorageAccessor.getItem(userId);

        if (settings?.global) {
            commit('initUserSettings', settings.global);
        }
    } catch (e) {
        console.error(e);
        LocalStorageAccessor.removeItem(userId);
    }
};
