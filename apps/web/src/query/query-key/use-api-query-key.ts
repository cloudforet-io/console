import { toValue } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from '@/query/query-key/_composable/use-app-context-query-key';
import { createImmutableObjectKeyItem } from '@/query/query-key/_helpers/immutable-query-key-helper';
import type {
    QueryKeyArray, ResourceName, ServiceName, Verb,
} from '@/query/query-key/_types/query-key-type';

// Cache for debug logs
// const debugLogCache = new Map<string, number>();
// const DEBUG_LOG_THROTTLE = 1000; // 1초


type _MaybeRefOrGetter<T> = T | Ref<T> | (() => T);
/**
 * Options for generating API query keys.
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
 *   id?,           // Optional, appears first in namespace if present
 *   params?,       // Optional, appears second if present
 *   deps?          // Optional, appears last if present
 * ]
 *
 * Note: The order of keys in the options object doesn't affect the final query key structure.
 * The query key will always maintain the above order, ensuring predictable cache management.
 *
 * @property id - Optional identifier for single resource operations (e.g., get, load).
 *               When present, it appears first in the namespace part of the query key,
 *               enabling hierarchical cache management for single-resource operations.
 * @property params - Optional parameters for the API request.
 * @property deps - Optional dependencies that affect the query key.
 */
interface UseAPIQueryKeyOptions<T extends object = object> {
    id?: _MaybeRefOrGetter<string>;
    params?: _MaybeRefOrGetter<T>;
    deps?: _MaybeRefOrGetter<object>;
}

type UseAPIQueryKeyResult<T extends object = object> = {
    key: ComputedRef<QueryKeyArray>;
    namespaces: ComputedRef<QueryKeyArray>;
    params: T extends undefined ? undefined : ComputedRef<T>;
    deps?: ComputedRef<object>;
    id?: ComputedRef<string>;
};

export const _useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>, T extends object = object>(
    service: S,
    resource: R,
    verb: V,
    options: UseAPIQueryKeyOptions<T> = {},
): UseAPIQueryKeyResult<T> => {
    // Runtime validation for development environment
    if (import.meta.env.DEV) {
        if (!service || !resource || !verb) {
            console.warn('Required parameters (service, resource, verb) must be provided');
        }
        _validateQueryKeyOptions(options);
    }

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
            ...(resolvedParams ? [createImmutableObjectKeyItem(resolvedParams)] : []),
            ...(resolvedDeps ? [createImmutableObjectKeyItem(resolvedDeps)] : []),
        ];
    });

    const namespaces = computed(() => [
        ...globalContext.value,
        service, resource, verb,
    ]);

    // NOTE: Only for development environment. After using tanstack query devtools, this will be removed.
    // if (import.meta.env.DEV) {
    //     _logQueryKeyDebug(queryKey.value);
    // }

    return {
        key: queryKey,
        namespaces,
        params: params ? computed(() => toValue(params)) : undefined,
        deps: deps ? computed(() => toValue(deps)) : undefined,
        id: id ? computed(() => toValue(id)) : undefined,
    } as UseAPIQueryKeyResult<T>;
};

const _validateQueryKeyOptions = <P extends object>(options: {
    id?: _MaybeRefOrGetter<string>;
    params?: _MaybeRefOrGetter<P>;
    deps?: _MaybeRefOrGetter<object>;
}) => {
    if (options.params) {
        const rawParams = toValue(options.params);
        if (rawParams === null || typeof rawParams !== 'object') {
            console.warn('params must be a non-null object');
        }
    }

    if (options.deps) {
        const rawDeps = toValue(options.deps);
        if (rawDeps === null || typeof rawDeps !== 'object') {
            console.warn('deps must be a non-null object');
        }
    }

    if (options.id) {
        const id = toValue(options.id);
        if (typeof id !== 'string') {
            console.warn('id must be a string');
        }
    }
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
