import { toValue } from '@vueuse/core';
import type { Ref, ComputedRef } from 'vue';
import { computed } from 'vue';

import { omitPageFromLoadParams, omitPageQueryParams } from '@/query/pagination/pagination-query-helper';
import { useQueryKeyAppContext } from '@/query/query-key/_composable/use-app-context-query-key';
import { createImmutableObjectKeyItem, normalizeQueryKeyPart } from '@/query/query-key/_helpers/query-key-helper';
import type {
    QueryKeyArray, ResourceName, ServiceName, Verb,
} from '@/query/query-key/types/query-key-type';


// Cache for debug logs
// const debugLogCache = new Map<string, number>();
// const DEBUG_LOG_THROTTLE = 1000;


type _MaybeRefOrGetter<T> = T | Ref<T> | ComputedRef<T> | (() => T);
/**
 * Generates a stable query key for service-level queries using service, resource, verb, and optional context/params.
 *
 * Structure:
 * [
 *   ...globalContext,
 *   service,
 *   resource,
 *   verb,
 *   contextKey?,   // optional
 *   params?,       // optional (pagination params excluded if enabled)
 * ]
 *
 * Options:
 * - contextKey: contextual key for scoping (e.g. selected ID)
 * - params: request parameters (ref, computed, or raw object)
 * - pagination: if true, removes pagination fields (e.g. page/start/limit) from params by verb type
 *
 * Example:
 * useServiceQueryKey('dashboard', 'data-table', 'load', {
 *   contextKey: selectedId,
 *   params: computed(() => ({ page, sort, granularity })),
 *   pagination: true, // removes 'page' from queryKey
 * });
 *
 * ---
 *
 * @property contextKey - Optional value (string | object | array) used to scope the cache context (e.g., ID or workspace)
 * @property params - API parameters. Can be a ref, computed, or raw object. Automatically processed if `pagination` is enabled.
 * @property pagination - When true, removes pagination-related params (`page`, `start`, `limit`) according to the verb ('load', 'list', 'analyze', etc.)
 *
 */
interface UseServiceQueryKeyOptions<T extends object = object> {
    contextKey?: _MaybeRefOrGetter<ContextKeyType>;
    params?: _MaybeRefOrGetter<T>;
    pagination?: boolean;
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
    const { params, contextKey, pagination } = options;

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
            ? normalizeQueryKeyPart(createImmutableObjectKeyItem(resolvedContextKey))
            : [];
    });

    const queryKey = computed(() => {
        const resolvedParams = pagination ? _omitPageParamsByVerb(verb, toValue(params)) as T : toValue(params);
        return [
            ...queryKeyAppContext.value,
            service, resource, verb,
            ...memoizedContextKey.value,
            ...(pagination ? ['pagination'] : []),
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
            const resolvedParams = pagination ? _omitPageParamsByVerb(verb, toValue(params)) as T : toValue(params);
            return createImmutableObjectKeyItem(resolvedParams);
        }),
        withSuffix: (arg) => {
            if (typeof arg === 'object' && arg !== null) {
                const cached = suffixCache.get(arg);
                if (cached) return cached;

                const result = [...queryKey.value, ...normalizeQueryKeyPart(createImmutableObjectKeyItem(arg))];
                suffixCache.set(arg, result);
                return result;
            }
            return [...queryKey.value, arg];
        },
    } as UseServiceQueryKeyResult<T>;
};
// const _normalizeQueryKeyPart = (key: unknown): QueryKeyArray => {
//     if (Array.isArray(key)) {
//         return key;
//     }
//     return [key];
// };

const _omitPageParamsByVerb = <S extends ServiceName, R extends ResourceName<S>>(verb: Verb<S, R>, params = {}) => {
    if (verb === 'load') return omitPageFromLoadParams(params);
    if (verb === 'list' || verb === 'analyze' || verb === 'stat') return omitPageQueryParams(params);
    return params;
};
