import type { Store } from 'vuex';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

const localStoragePlugin = (store: Store<any>) => {
    const userStore = useUserStore(pinia);
    store.subscribe((mutation, state) => {
        const settings = LocalStorageAccessor.getItem(userStore.state.userId) ?? {};
        const global = settings.global || {};
        switch (mutation.type) {
        case 'display/setGnbNotificationLastReadTime':
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
