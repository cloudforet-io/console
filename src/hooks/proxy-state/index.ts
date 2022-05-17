import {
    computed, Ref, ref, watch,
} from '@vue/composition-api';


export function useProxyValue<T = any>(
    name: string,
    props: any,
    emit: any,
    extraEventNames?: string|string[],
): Ref<T> {
    const proxyValue = ref<T>(props[name]);
    const setProxyValue = (value: T) => {
        (proxyValue.value as T) = value;
        if (!extraEventNames) {
            emit(`update:${name}`, value);
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
