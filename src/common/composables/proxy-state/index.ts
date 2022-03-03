import {
    computed, Ref, ref, watch,
} from '@vue/composition-api';


export function useProxyValue<T = any>(
    name: string,
    props: any,
    emit: any,
): Ref<T> {
    const proxyValue = ref<T>(props[name]);
    const setProxyValue = (value: T) => {
        (proxyValue.value as T) = value;
        emit(`update:${name}`, value);
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
