import type { Store } from 'vuex';

import { STORAGE_KEY } from '@/store/modules/display';

const DISPLAY_MUTATIONS = ['display/setCurrency'];

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (DISPLAY_MUTATIONS.includes(mutation.type)) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currency: state.display.currency,
            }));
        }
    });
};

export default [
    localStoragePlugin,
];
