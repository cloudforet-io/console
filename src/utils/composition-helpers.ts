import {
    computed, ref,
} from 'vue';
import type { Ref } from 'vue';
import type Vue from 'vue';


/**
 * Event listeners by pass
 * @param listeners
 * @param name
 * @param event params
 */
export const makeByPassListeners = (listeners: Record<string, any | any[]>, name: string, ...args: any[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (Array.isArray(listeners[name])) listeners[name].forEach((f) => f(...args));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
export const makeProxy = <T>(name: string, props: any, emit: any): Ref<T> => computed({
    get: () => props[name],
    set: (val) => {
        emit(`update:${name}`, val);
    },
});

/**
 * make proxy computed or a value if there's no listener for tracking sync
 * @param name
 * @param vm
 * @param initData
 * * @param events?
 * @return {Ref<*>|*}
 */
export function makeOptionalProxy <T=any>(name: string, vm: Vue, initData: any, events?: string[]) {
    let propsVal = vm.$props[name];
    const currentVal = ref(propsVal === undefined ? initData : propsVal);
    let prevVal = currentVal.value;
    return computed<T>({
        set(val) {
            if (vm.$listeners[`update:${name}`]) {
                vm.$emit(`update:${name}`, val);
            } else currentVal.value = val;
            if (Array.isArray(events)) events.forEach((d) => vm.$emit(d, val));
        },
        get() {
            if (vm.$listeners[`update:${name}`]) return vm.$props[name];

            if (vm.$props[name] !== propsVal) {
                propsVal = vm.$props[name];
                currentVal.value = propsVal;
                prevVal = currentVal.value;
            } else if (currentVal.value !== prevVal) {
                prevVal = currentVal.value;
                currentVal.value = prevVal;
            }
            return currentVal.value;
        },
    });
}
