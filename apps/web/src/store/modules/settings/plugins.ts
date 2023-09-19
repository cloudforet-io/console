import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import type { Store } from 'vuex';


const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        const settings = LocalStorageAccessor.getItem(state.user.userId) ?? {};
        const global = settings.global || {};
        switch (mutation.type) {
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
