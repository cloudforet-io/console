import { kebabCase } from 'lodash';
import type { Ref } from 'vue';
import {
    computed, ref, watch,
} from 'vue';


/**
 * @name useProxyValue
 * @description In case of array or object, set() does not work even if the original value is modified unless reallocated.
 */
export function useProxyValue<T = any>(
    name: string,
    props: any,
    emit: any,
    extraEventNames?: string|string[],
): Ref<T> {
    const proxyValue = ref<T>(props[name]);
    const kebabCaseName = kebabCase(name);
    const setProxyValue = (value: T) => {
        (proxyValue.value as T) = value;
        if (!extraEventNames) {
            emit(`update:${name}`, value); // will be deprecated
            emit(`update:${kebabCaseName}`, value);
            return;
        }

        if (Array.isArray(extraEventNames)) {
            extraEventNames.forEach((eventName) => {
                emit(eventName, value);
            });
        } else {
            emit(extraEventNames, value);
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
