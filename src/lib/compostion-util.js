import { computed, onUnmounted } from '@vue/composition-api';

export const makeProxy = (name, props, emit) => computed({
    get: () => props[name],
    set: val => emit(`update:${name}`, val),
});

export const makeByPass = (emit, name) => (...event) => {
    emit(name, ...event);
};
export const mountBusEvent = (bus, eventName, handler) => {
    bus.$on(eventName, handler);
    onUnmounted(() => bus.$off(eventName, handler));
};
