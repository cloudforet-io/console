import type { Store } from 'vuex';

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'settings/setUserSetting') {
            window.localStorage.setItem(state.user.userId, JSON.stringify(state.settings.user));
        }
    });
};

export default [
    localStoragePlugin,
];
