import { Store } from 'vuex';
import { STORAGE_KEY } from '@/store/modules/user';
import * as mutations from './mutations';

const USER_MUTATIONS = Object.keys(mutations).map((mutation) => {
    return `user/${mutation}`;
});

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (USER_MUTATIONS.indexOf(mutation.type) >= 0) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
        }
    });
};

export default [
    localStoragePlugin,
];
