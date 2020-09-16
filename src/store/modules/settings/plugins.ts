import { Store } from 'vuex';
import { STORAGE_KEY } from '@/store/modules/user';

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'user/settings') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
        }
    });
};

export default [
    localStoragePlugin,
];
