import type { Ref, SetupContext } from 'vue';
import {
    computed, ref, watch,
} from 'vue';

/**
 * @description It detects changes in prop and creates a state that is automatically reflected.
 *              'update:{prop name}' event occurs when there is a change in state, so sync binding can be used.
 * @param name
 * @param props
 * @param emit
 * @param additionalEvents Additional event name or list of event names to be triggered when state is changed
 */
export function useProxyValue<T = any, Prop = any>(
    name: string,
    props: Prop,
    emit: SetupContext['emit'],
    additionalEvents?: string|string[],
): Ref<T> {
    const emitEvents = (value: T) => {
        emit(`update:${name}`, value);
        if (!additionalEvents) return;
        if (typeof additionalEvents === 'string') emit(additionalEvents, value);
        else if (Array.isArray(additionalEvents)) additionalEvents.forEach((eventName) => emit(eventName, value));
    };

    const proxyValue = ref<T>(props[name]);
    const setProxyValue = (value: T) => {
        (proxyValue.value as T) = value;
        emitEvents(value);
    };

    watch(() => props[name], (value) => {
        if (value !== proxyValue.value) proxyValue.value = value;
    });

    return computed<T>({
        get: () => proxyValue.value as T,
        set: (value) => {
            setProxyValue(value);
        },
    });
}
