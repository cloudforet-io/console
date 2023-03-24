import type { Store } from 'vuex';

import { STORAGE_KEY } from '@/store/modules/settings';

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'settings/setItem') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
        }
    });
};

export default [
    localStoragePlugin,
];
