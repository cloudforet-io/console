import type { Action } from 'vuex';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import type { SettingsState } from '@/store/modules/settings/type';

export const initSettings: Action<SettingsState, any> = ({ commit, rootState }): void => {
    const userId = rootState?.user?.userId;
    if (!LocalStorageAccessor.getItem('spaceConnector/accessToken')) return;
    try {
        const settings = LocalStorageAccessor.getItem(userId);

        if (settings) {
            commit('initUserSettings', settings.global);
        }
    } catch (e) {
        console.error(e);
        LocalStorageAccessor.removeItem(userId);
    }
};
