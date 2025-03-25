import { toValue } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { createImmutableObjectKeyItem } from '@/query/_helpers/immutable-query-key-helper';
import type {
    QueryKeyArray, ResourceName, ServiceName, Verb,
} from '@/query/_types/query-key-type';
import { useQueryKeyAppContext } from '@/query/composables/use-app-context-query-key';



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
        deps: deps ? computed(() => toValue(deps)) : undefined,
        id: id ? computed(() => toValue(id)) : undefined,
    };
};
