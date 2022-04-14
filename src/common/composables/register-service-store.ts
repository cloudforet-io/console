import { store } from '@/store';
import { onMounted, onUnmounted } from '@vue/composition-api';
import { Module } from 'vuex';
import ErrorHandler from '@/common/composables/error/errorHandler';

type Path = string[]|string;
type AfterRegisterFunc = (...args: any[]) => void

const getPath = (path: Path): string[] => {
    if (typeof path === 'string') {
        return ['service', ...path.split('/')];
    }
    return ['service', ...path];
};

function registerStore<T>(path: Path, storeModule: Module<T, any>, afterRegister?: AfterRegisterFunc) {
    if (!store.hasModule(path as string)) {
        store.registerModule<T>(path as string, storeModule);
        if (afterRegister) afterRegister();
    }

    onUnmounted(() => {
        store.unregisterModule(path as string);
    });

    // for hot reloading
    onMounted(() => {
        if (!store.hasModule(path as string)) {
            store.registerModule<T>(path as string, storeModule);
            if (afterRegister) afterRegister();
        }
    });
}

const prepareParentModules = (path: string[]) => {
    const eachPaths = path.slice(0, path.length - 1);
    const parentPath: string[] = [];
    eachPaths.forEach((p) => {
        parentPath.push(p);
        if (!store.hasModule(parentPath)) {
            ErrorHandler.handleError(`[Warn] '${parentPath.join('/')}' module is not created. The store has been temporarily created and operated, so please check it.`);
            registerStore(parentPath, { namespaced: true });
        }
    });
};

export function registerServiceStore<T>(_path: Path, storeModule: Module<T, any>, afterRegister?: AfterRegisterFunc) {
    const path = getPath(_path);

    prepareParentModules(path);

    registerStore(path, storeModule, afterRegister);
}
