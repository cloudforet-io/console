import createLogger from 'vuex/dist/logger';
import { Store } from 'vuex';
import { USER_STORAGE_KEY } from '@/store/modules/user';

const DEBUG = process.env.NODE_ENV !== 'production';

const MUTATION_MAP: Record<string, [string, string]> = {
    'user/setUser': ['user', USER_STORAGE_KEY],
};

const saveLocalStorage = (storageKey: string, data: any): void => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
};

const localStoragePlugin = (store: Store<any>) => {
    store.subscribe((mutation, state) => {
        if (mutation.type in MUTATION_MAP) {
            const [name, storageKey] = MUTATION_MAP[mutation.type];
            saveLocalStorage(storageKey, state[name]);
        }
    });
};

export default DEBUG ? [createLogger(), localStoragePlugin] : [localStoragePlugin];
