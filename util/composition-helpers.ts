import {
    ComponentRenderProxy,
    computed, getCurrentInstance, onMounted, onUnmounted, ref, Ref,
} from '@vue/composition-api';

/**
 * Event listeners by pass
 * @param listeners
 * @param name
 * @param event params
 */
export const makeByPassListeners = (listeners: Record<string, Function | Function[]>, name: string, ...args: any[]) => {
    // @ts-ignore
    if (Array.isArray(listeners[name])) listeners[name].forEach(f => f(...args));
    // @ts-ignore
    else if (typeof listeners[name] === 'function') listeners[name](...args);
};

/**
 * event by pass
 * @param emit
 * @param name
 * @return {function(...[*]=)}
 */
export const makeByEvent = (emit: any, name: string) => (...event: any) => {
    emit(name, ...event);
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
export function makeOptionalProxy <T=any>(name: string, vm, initData: any, events?: string[]) {
    let propsVal = vm.$props[name];
    const currentVal = ref(propsVal === undefined ? initData : propsVal);
    let prevVal = currentVal.value;
    return computed<T>({
        set(val) {
            if (vm.$listeners[`update:${name}`]) {
                vm.$emit(`update:${name}`, val);
            } else currentVal.value = val;
            if (Array.isArray(events)) events.forEach(d => vm.$emit(d, val));
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


export function makeVModelProxy<T extends any>(name = 'value', event = 'input', transform: ((val: any) => any)|null = null): Ref<T> {
    const vm = getCurrentInstance() as ComponentRenderProxy;
    let setter: (val: any) => void;
    if (transform) {
        setter = (val) => { vm.$emit(event, transform(val)); };
    } else {
        setter = (val) => { vm.$emit(event, val); };
    }

    return computed({
        get: () => vm?.$props[name],
        set: setter,
    });
}


/**
 * state & functions for tracking elements whether they are mouse-over or out.
 * @param disabled
 * @return {{onMouseOut: onMouseOut, isMouseOver: Ref<HasDefined<S> extends true ? S : RefValue<T>>, onMouseOver: onMouseOver}}
 */
export const mouseOverState = (disabled?: boolean) => {
    const disable = disabled || false;
    const isMouseOver = ref(false);
    const onMouseOver = () => {
        if (!disable && !isMouseOver.value) {
            isMouseOver.value = true;
        }
    };
    const onMouseOut = () => {
        if (!disable && isMouseOver.value) {
            isMouseOver.value = false;
        }
    };
    return {
        isMouseOver,
        onMouseOver,
        onMouseOut,
    };
};


/**
 * Add and remove an event listener when mounted & unmounted.
 * This is useful to automatically hide autocomplete or dropdown context menu.
 * @param eventName
 * @param func
 */
export const windowEventMount = (eventName: string, func: any) => {
    onMounted(() => window.addEventListener(eventName, func));
    onUnmounted(() => window.removeEventListener(eventName, func));
};
