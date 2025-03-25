import { toValue } from '@vueuse/core';
import type { Ref } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from '@/query/_composables/use-query-key-app-context';
import { createImmutableObjectKeyItem } from '@/query/_helpers/immutable-key-helper';
import type { ResourceName, ServiceName, Verb } from '@/query/_types/query-key-type';


type _MaybeRefOrGetter<T> = T | Ref<T> | (() => T);

type UseAPIQueryKeyOptions = {
    id?: _MaybeRefOrGetter<string>;
    params: _MaybeRefOrGetter<object>;
    deps?: _MaybeRefOrGetter<object>;
};

export const useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>>(
    service: S,
    resource: R,
    verb: V,
    options: UseAPIQueryKeyOptions,
) => {
    const { id, params, deps } = options;

    const queryKeyAppContext = useQueryKeyAppContext();
    const globalContext = computed(() => queryKeyAppContext.value);

    const queryKey = computed(() => {
        const resolvedParams = toValue(params);
        const resolvedDeps = toValue(deps);
        const resolvedId = id ? toValue(id) : undefined;

        return [
            ...globalContext.value,
            service, resource, verb,
            ...(resolvedId ? [resolvedId] : []),
            createImmutableObjectKeyItem(resolvedParams),
            ...(resolvedDeps ? [createImmutableObjectKeyItem(resolvedDeps)] : []),
        ];
    });

    return {
        key: queryKey,
        params: computed(() => toValue(params)),
    };
};
