import type { Store } from 'vuex';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { STORAGE_KEY } from '@/store/modules/user';

import * as mutations from './mutations';

const USER_MUTATIONS = Object.keys(mutations).map((mutation) => `user/${mutation}`);

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (USER_MUTATIONS.includes(mutation.type)) {
            LocalStorageAccessor.setItem(STORAGE_KEY, state.user);
        }
    });
};

export default [
    localStoragePlugin,
];
