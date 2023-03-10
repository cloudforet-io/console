import { onMounted, onUnmounted } from 'vue';
import type { Module } from 'vuex';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

type Path = string[]|string;
// type AfterRegisterFunc = (...args: any[]) => void

const getPathList = (path: Path): string[] => {
    if (typeof path === 'string') {
        return path.split('/');
    }
    return path;
};

const undefineServiceStore = (serviceStore) => {
    Object.defineProperties(serviceStore, {
        state: { get() { return null; } },
        getters: { get() { return null; } },
        commit: { get() { return null; } },
        dispatch: { get() { return null; } },
    });
};

function registerStore<T>(path: Path, storeModule: Module<T, any>, serviceStore) {
    if (!store.hasModule(path as string)) {
        store.registerModule<T>(path as string, storeModule);
    }

    onUnmounted(() => {
        store.unregisterModule(path as string);
        undefineServiceStore(serviceStore);
    });

    // for hot reloading
    onMounted(() => {
        if (!store.hasModule(path as string)) {
            store.registerModule<T>(path as string, storeModule);
        }
    });
}

const prepareParentModules = (path: string[], serviceStore) => {
    const eachPaths = path.slice(0, path.length - 1);
    const parentPath: string[] = [];
    eachPaths.forEach((p) => {
        parentPath.push(p);
        if (!store.hasModule(parentPath)) {
            ErrorHandler.handleError(`[Warn] '${parentPath.join('/')}' module is not created. The store has been temporarily created and operated, so please check it.`);
            registerStore(parentPath, { namespaced: true }, serviceStore);
        }
    });
};

function getGetters(path: string) {
    const result = {};
    Object.keys(store.getters)
        .filter((k) => k.startsWith(path))
        .forEach((k) => {
            Object.defineProperty(result, k.slice(path.length + 1), {
                get() {
                    return store.getters[k];
                },
            });
        });
    return result;
}

export function defineServiceStore<T>(servicePathList: string[], serviceStore = {}): any {
    const pathStr = servicePathList.join('/');
    const _getters = getGetters(pathStr);
    let _state: T = store.state;
    servicePathList.forEach((p) => {
        if (_state) _state = _state[p];
    });
    Object.defineProperties(serviceStore, {
        state: {
            get() { return _state; }, configurable: true,
        },
        getters: {
            get() { return _getters; }, configurable: true,
        },
        dispatch: {
            get() { return (path, payload) => store.dispatch(`${pathStr}/${path}`, payload); }, configurable: true,
        },
        commit: {
            get() { return (path, payload) => store.commit(`${pathStr}/${path}`, payload); }, configurable: true,
        },
    });
    return serviceStore;
}

export function registerServiceStore<T>(path: Path, storeModule: Module<T, any>, serviceStore = {}) {
    const paths = getPathList(path);

    prepareParentModules(paths, serviceStore);

    registerStore(paths, storeModule, serviceStore);

    defineServiceStore<T>(paths, serviceStore);
}
