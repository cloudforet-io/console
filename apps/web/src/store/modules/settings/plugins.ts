import type { Store } from 'vuex';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        const settings = LocalStorageAccessor.getItem(state.user.userId) ?? {};
        const global = settings.global || {};
        switch (mutation.type) {
        case 'settings/setCurrencyRates':
            LocalStorageAccessor.setItem(state.user.userId, {
                ...settings,
                global: {
                    ...global,
                    currencyRates: mutation.payload,
                },
            });
            break;
        case 'settings/setCurrency':
            LocalStorageAccessor.setItem(state.user.userId, {
                ...settings,
                global: {
                    ...global,
                    currency: mutation.payload,
                },
            });
            break;
        case 'settings/setCurrencyUpdateTime':
            LocalStorageAccessor.setItem(state.user.userId, {
                ...settings,
                global: {
                    ...global,
                    currencyUpdateTime: mutation.payload,
                },
            });
            break;
        case 'settings/setGnbNotificationLastReadTime':
            LocalStorageAccessor.setItem(state.user.userId, {
                ...settings,
                global: {
                    ...global,
                    gnbNotificationLastReadTime: mutation.payload,
                },
            });
            break;
        default:
            break;
        }
    });
};

export default [
    localStoragePlugin,
];
