import { toValue } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from '@/query/query-key/_composable/use-app-context-query-key';
import { createImmutableObjectKeyItem } from '@/query/query-key/_helpers/immutable-query-key-helper';
import type {
    QueryKeyArray, ResourceName, ServiceName, Verb,
} from '@/query/query-key/_types/query-key-type';



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
 *   params,        // Required, always present
 *   deps?          // Optional, appears last if present
 * ]
 *
 * Note: The order of keys in the options object doesn't affect the final query key structure.
 * The query key will always maintain the above order, ensuring predictable cache management.
 *
 * @property id - Optional identifier for single resource operations (e.g., get, load).
 *               When present, it appears first in the namespace part of the query key,
 *               enabling hierarchical cache management for single-resource operations.
 * @property params - Required parameters for the API request.
 * @property deps - Optional dependencies that affect the query key.
 */
interface UseAPIQueryKeyOptions<P extends object> {
    id?: _MaybeRefOrGetter<string>;
    params: _MaybeRefOrGetter<P>;
    deps?: _MaybeRefOrGetter<object>;
}

interface UseAPIQueryKeyResult<P> {
    key: ComputedRef<QueryKeyArray>;
    params: ComputedRef<P>;
    deps?: ComputedRef<object>;
    id?: ComputedRef<string>;
}

export const _useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>, P extends object>(
    service: S,
    resource: R,
    verb: V,
    options: UseAPIQueryKeyOptions<P>,
): UseAPIQueryKeyResult<P> => {
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
            createImmutableObjectKeyItem(resolvedParams),
            ...(resolvedDeps ? [createImmutableObjectKeyItem(resolvedDeps)] : []),
        ];
    });


    // NOTE: Only for development environment. After using tanstack query devtools, this will be removed.
    if (import.meta.env.DEV) {
        console.debug(`[QueryKey] ${String(service)}/${String(resource)}/${String(verb)}`, JSON.stringify(queryKey.value, null, 2));
    }

    return {
        key: queryKey,
        params: computed(() => toValue(params)),
        deps: deps ? computed(() => toValue(deps)) : undefined,
        id: id ? computed(() => toValue(id)) : undefined,
    };
};



const _validateQueryKeyOptions = <P extends object>(options: {
    id?: _MaybeRefOrGetter<string>;
    params: _MaybeRefOrGetter<P>;
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
