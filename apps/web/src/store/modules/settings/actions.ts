import type { SetItemRequest } from './type';

export const setItem = ({ commit, rootState }, item: SetItemRequest): void => {
    const userId = rootState?.user?.userId;
    if (userId) commit('setUserSetting', { item });
};

export const initSettings = ({ commit, rootState }): void => {
    const userId = rootState?.user?.userId;
    if (!window.localStorage.getItem('spaceConnector/accessToken')) return;
    try {
        const settings = window.localStorage.getItem(userId);

        if (settings) {
            const settingsObj = JSON.parse(settings);
            commit('initUserSettings', { item: settingsObj });
        }
    } catch (e) {
        window.localStorage.removeItem(userId);
    }
};
