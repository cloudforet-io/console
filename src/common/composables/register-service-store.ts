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
}

export function registerServiceStore<T>(_path: Path, storeModule: Module<T, any>, afterRegister?: AfterRegisterFunc) {
    const path = getPath(_path);
    const containerPath = path.slice(0, -1);
    if (!store.hasModule(containerPath)) {
        registerStore(containerPath, {
            namespaced: true,
        });
        ErrorHandler.handleError('[Warn] \'Container Store\' not created. The store has been temporarily created and operated, so please check it.');
    }
    onUnmounted(() => {
        store.unregisterModule(path);
    });

    // for hot reloading
    onMounted(() => { registerStore(path, storeModule, afterRegister); });

    registerStore(path, storeModule, afterRegister);
}
