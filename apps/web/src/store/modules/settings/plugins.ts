import type { Store } from 'vuex';

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        const settings = window.localStorage.getItem(state.user.userId);
        const settingsObj = settings ? JSON.parse(settings) : {};
        const global = settingsObj.global || {};
        switch (mutation.type) {
        case 'settings/setCurrencyRate':
            window.localStorage.setItem(state.user.userId, JSON.stringify({
                ...settingsObj,
                global: {
                    ...global,
                    currencyRate: mutation.payload,
                },
            }));
            break;
        case 'settings/setGnbNotificationLastReadTime':
            window.localStorage.setItem(state.user.userId, JSON.stringify({
                ...settingsObj,
                global: {
                    ...global,
                    gnbNotificationLastReadTime: mutation.payload,
                },
            }));
            break;
        default:
            break;
        }
    });
};

export default [
    localStoragePlugin,
];
