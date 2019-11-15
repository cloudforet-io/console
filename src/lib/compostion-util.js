import { computed, onMounted, onUnmounted } from '@vue/composition-api';
import { buttonSlotCase } from '@/components/organisms/buttons/tooltip-button/TooltipButton.stories';
import serverEventBus from '@/views/inventory/server/ServerEventBus';

export const makeProxy = (name, props, emit) => computed({
    get: () => props[name],
    set: val => emit(`update:${name}`, val),
});

export const makeByPass = (emit, name) => (...event) => {
    emit(name, ...event);
};
export const mountBusEvent = (bus, eventName, handler) => {
    onMounted(() => bus.$on(eventName, handler));
    onUnmounted(() => bus.$off(eventName, handler));
};
