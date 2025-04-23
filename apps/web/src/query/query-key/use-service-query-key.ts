import { toValue } from '@vueuse/core';
import type { Ref, ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from '@/query/query-key/_composable/use-app-context-query-key';
import { createImmutableObjectKeyItem } from '@/query/query-key/_helpers/immutable-query-key-helper';
import type {
    QueryKeyArray, ResourceName, ServiceName, Verb,
} from '@/query/query-key/_types/query-key-type';

// Cache for debug logs
// const debugLogCache = new Map<string, number>();
// const DEBUG_LOG_THROTTLE = 1000; // 1초


type _MaybeRefOrGetter<T> = T | Ref<T> | ComputedRef<T> | (() => T);
/**
 * Options for generating service query keys.
 *
 * While the options are provided as an object where the order of keys doesn't matter,
 * the generated query key will always follow this structure:
 *
 * ```typescript
 * [
 *   ...globalContext,
 *   service,
 *   resource,
 *   verb,
 *   contextKey?,    // Optional, appears first in namespace if present
 *   params?,        // Optional, appears second if present
 * ]
 *
 * Note: The order of keys in the options object doesn't affect the final query key structure.
 * The query key will always maintain the above order, ensuring predictable cache management.
 *
 * @property contextKey - Optional key for contextual data (string, array, or object).
 *                       When present, it appears first in the namespace part of the query key,
 *                       enabling contextual cache management.
 * @property params - Optional parameters for the API request.
 *                    When present, it appears second in the namespace part of the query key.
 */
interface UseServiceQueryKeyOptions<T extends object = object> {
    contextKey?: _MaybeRefOrGetter<ContextKeyType>;
    params?: _MaybeRefOrGetter<T>;
}
type ContextKeyType = string|unknown[]|object;

type UseServiceQueryKeyResult<T extends object = object> = {
    key: ComputedRef<QueryKeyArray>;
    params: ComputedRef<T>;
    withSuffix: (arg: ContextKeyType) => QueryKeyArray;
};

export const useServiceQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>, T extends object = object>(
    service: S,
    resource: R,
    verb: V,
    options: UseServiceQueryKeyOptions<T> = {},
): UseServiceQueryKeyResult<T> => {
    const { params, contextKey } = options;

    // Runtime validation for development environment
    if (import.meta.env.DEV) {
        if (!service || !resource || !verb) {
            console.warn('Required parameters (service, resource, verb) must be provided');
        }
        if (params) {
            const rawParams = toValue(params);
            if (rawParams === null || typeof rawParams !== 'object') {
                console.warn('params must be a non-null object');
            }
        }
    }

    const queryKeyAppContext = useQueryKeyAppContext();


    const memoizedContextKey = computed(() => {
        const resolvedContextKey = toValue(contextKey);
        return resolvedContextKey
            ? _normalizeQueryKeyPart(createImmutableObjectKeyItem(resolvedContextKey))
            : [];
    });

    const queryKey = computed(() => {
        const resolvedParams = toValue(params);
        return [
            ...queryKeyAppContext.value,
            service, resource, verb,
            ...memoizedContextKey.value,
            ...(resolvedParams ? [createImmutableObjectKeyItem(resolvedParams)] : []),
        ];
    });

    // NOTE: Only for development environment. After using tanstack query devtools, this will be removed.
    // if (import.meta.env.DEV) {
    //     _logQueryKeyDebug(queryKey.value);
    // }


    const suffixCache = new WeakMap<object, QueryKeyArray>();
    return {
        key: queryKey,
        params: computed(() => {
            const resolvedParams = toValue(params);
            return createImmutableObjectKeyItem(resolvedParams);
        }),
        withSuffix: (arg) => {
            if (typeof arg === 'object' && arg !== null) {
                const cached = suffixCache.get(arg);
                if (cached) return cached;

                const result = [...queryKey.value, ..._normalizeQueryKeyPart(createImmutableObjectKeyItem(arg))];
                suffixCache.set(arg, result);
                return result;
            }
            return [...queryKey.value, arg];
        },
    } as UseServiceQueryKeyResult<T>;
};


const _normalizeQueryKeyPart = (key: unknown): QueryKeyArray => {
    if (Array.isArray(key)) {
        return key;
    }
    return [key];
};

// const _logQueryKeyDebug = (queryKey: QueryKeyArray) => {
//     const now = Date.now();
//     const key = queryKey.join('/');
//     const lastLogTime = debugLogCache.get(key) || 0;

//     if (now - lastLogTime >= DEBUG_LOG_THROTTLE) {
//         console.debug('[QueryKey]', { queryKey });
//         debugLogCache.set(key, now);
//     }
// };
