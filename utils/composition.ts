import { computed, getCurrentInstance, Ref } from '@vue/composition-api';

export const makeByPassListeners = (listeners: Record<string, Function | Function[]>, name: string, ...args: any[]) => {
    // @ts-ignore
    if (Array.isArray(listeners[name])) listeners[name].forEach(f => f(...args));
    // @ts-ignore
    else if (typeof listeners[name] === 'function') listeners[name](...args);
};


/**
 * make proxy computed that same name as props
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
export const makeProxy = <T extends any>(name: string, props: any, emit: any): Ref<T> => computed({
    get: () => props[name],
    set: (val) => {
        if (emit) {
            emit(`update:${name}`, val);
        } else {
            emit(val);
        }
    },
});
