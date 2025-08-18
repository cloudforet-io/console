import { toValue } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from '@/query/core/query-key/_composable/use-app-context-query-key';
import { createImmutableObjectKeyItem, normalizeQueryKeyPart } from '@/query/core/query-key/_helpers/query-key-helper';
import type { QueryKeyArray, QueryKeyContext, QueryKeyWithSuffix } from '@/query/core/query-key/types/query-key-type';


type _MaybeRefOrGetter<T> = T | Ref<T> | ComputedRef<T> | (() => T);


type UseResourceQueryKeyResult = {
    key: ComputedRef<QueryKeyArray>;
    withSuffix: QueryKeyWithSuffix;
};

interface UseResourceQueryKeyMenuHandlerOptions {
    verb: 'list'|'stat';
    contextKey?: _MaybeRefOrGetter<QueryKeyContext>;
}

export const useResourceQueryKey = (resource: _MaybeRefOrGetter<string>, menuHandlerOptions?: UseResourceQueryKeyMenuHandlerOptions): UseResourceQueryKeyResult => {
    const { verb = 'list', contextKey } = menuHandlerOptions || {};

    // Runtime validation for development environment
    if (import.meta.env.DEV) {
        if (!resource) {
            console.warn('Required parameters (resource) must be provided');
        }
    }

    const queryKeyAppContext = useQueryKeyAppContext();

    const memoizedContextKey = computed(() => {
        const resolvedContextKey = toValue(contextKey);
        return resolvedContextKey
            ? normalizeQueryKeyPart(createImmutableObjectKeyItem(resolvedContextKey))
            : [];
    });

    const queryKey = computed(() => {
        const baseKey = [
            ...queryKeyAppContext.value,
            toValue(resource),
        ];
        if (!menuHandlerOptions) return baseKey;

        const menuHandlerKey = [
            ...baseKey,
            verb,
            ...memoizedContextKey.value,
        ];
        return menuHandlerKey;
    });

    const suffixCache = new WeakMap<object, QueryKeyArray>();
    return {
        key: queryKey,
        withSuffix: (arg) => {
            if (typeof arg === 'object' && arg !== null) {
                const resolvedArg = createImmutableObjectKeyItem(arg);
                const cached = suffixCache.get(resolvedArg);
                if (cached) return cached;

                const result = [...queryKey.value, ...normalizeQueryKeyPart(resolvedArg)];
                suffixCache.set(resolvedArg, result);
                return result;
            }
            return [...queryKey.value, arg];
        },
    };
};
