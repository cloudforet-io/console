import { store } from '@/store';
import { onMounted, onUnmounted } from '@vue/composition-api';
import { Module } from 'vuex';

type Path = string[]|string;
type AfterRegisterFunc = (...args: any[]) => void

const getPath = (path: Path): string[] => {
    if (typeof path === 'string') return ['service', path];
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
    registerStore(path, storeModule, afterRegister);

    onUnmounted(() => {
        store.unregisterModule(path);
    });

    // for hot reloading
    onMounted(() => { registerStore(path, storeModule); });
}
