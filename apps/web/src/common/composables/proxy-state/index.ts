import type { Ref } from 'vue';
import {
    computed, ref, watch,
} from 'vue';

import { kebabCase } from 'lodash';

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
    emit: any,
    additionalEvents?: string|string[],
): Ref<T> {
    const proxyValue = ref<T>(props[name]);
    const kebabCaseName = kebabCase(name);
    const setProxyValue = (value: T) => {
        (proxyValue.value as T) = value;
        if (!additionalEvents) {
            emit(`update:${name}`, value); // will be deprecated
            emit(`update:${kebabCaseName}`, value);
            return;
        }

        if (Array.isArray(additionalEvents)) {
            additionalEvents.forEach((eventName) => {
                emit(eventName, value);
            });
        } else {
            emit(additionalEvents, value);
        }
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
