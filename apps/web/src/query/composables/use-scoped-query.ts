/**
 * useScopedQuery - A custom wrapper around `useQuery` to enforce scope-based API fetching.
 *
 * ## Why this hook exists?
 * This hook was created to integrate **scope-based API access control** with Vue Query.
 * It ensures that queries are only executed when the user's granted scope matches the required scope.
 * Additionally, it automatically handles loading states and prevents unnecessary queries.
 *
 * ## Functionality
 * - Extends `useQuery` with **grant scope validation**.
 * - Runs queries only when **the user's scope is valid** and the app is **ready**.
 * - Uses Vue's **reactivity** to dynamically compute the `enabled` state.
 * - Supports both **static and reactive `enabled` values**.
 *
 * ## Parameters:
 * - `options`: Standard **Vue Query options** (`UseQueryOptions`).
 * - `requiredScopes`: A list of **required grant scopes** to determine if the query should execute.
 *
 * ## Supported Query Options:
 * - `queryKey`, `queryFn`, `select`, `initialData`, `staleTime`, `enabled` (static or reactive)
 *
 * ## Example:
 * const query = useScopedQuery(
 *   {
 *     queryKey: ['dashboard', dashboardId],
 *     queryFn: () => fetchDashboardData(dashboardId),
 *     enabled: computed(() => isUserAuthorized.value),
 *   },
 *   ['DOMAIN', 'WORKSPACE']
 * );
 */

import type { MaybeRef } from '@vueuse/core';
import { toValue } from '@vueuse/core';
import { computed, type ComputedRef } from 'vue';

import {
    useQuery, type UseQueryOptions, type UseQueryReturnType,
} from '@tanstack/vue-query';

import type { GrantScope } from '@/api-clients/identity/token/schema/type';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';


type ScopedEnabled = MaybeRef<boolean>;


export const useScopedQuery = <TQueryFnData, TError = unknown, TData = TQueryFnData>(
    options: UseQueryOptions<TQueryFnData, TError, TData>,
    requiredScopes: [GrantScope, ...GrantScope[]],
): UseQueryReturnType<TData, TError> => {
    // [Dev Warning] This query is missing `requiredScopes`.
    // All scoped queries must explicitly define at least one valid scope for clarity and safety.
    if (import.meta.env.DEV && (!requiredScopes || requiredScopes.length === 0)) {
        _warnOncePerTick(() => {
            console.warn('[useScopedQuery] `requiredScopes` is missing or empty.', {
                queryKey: _extractQueryKey((options as any).queryKey),
                suggestion: 'Pass at least one valid scope like [\'DOMAIN\'], [\'WORKSPACE\'], etc.',
            });
            return true;
        });
    }

    const appContextStore = useAppContextStore();
    const authorizationStore = useAuthorizationStore();

    const currentGrantScope = computed<GrantScope | undefined>(
        () => authorizationStore.state.currentGrantInfo?.scope,
    );
    const isAppReady = computed(() => !appContextStore.getters.globalGrantLoading);

    const isValidScope = computed(() => currentGrantScope.value !== undefined
        && requiredScopes.includes(currentGrantScope.value));

    const rawEnabled = (options as { enabled?: ScopedEnabled }).enabled;
    const queryEnabled = computed(() => {
        const inheritedEnabled = rawEnabled !== undefined ? toValue(rawEnabled) : true;
        return inheritedEnabled && isValidScope.value && isAppReady.value;
    });

    // [Dev Warning] The current user's scope is not included in the allowed `requiredScopes`.
    // This usually indicates a configuration mistake in the query declaration.
    if (import.meta.env.DEV) {
        const currentScope = currentGrantScope.value;
        if (isAppReady.value && currentScope && toValue(rawEnabled) && !requiredScopes.includes(currentScope)) {
            _warnOncePerTick(() => {
                console.warn('[useScopedQuery] Invalid requiredScopes for current scope:', {
                    queryKey: _extractQueryKey((options as any).queryKey),
                    requiredScopes,
                    currentScope,
                });
                return true;
            });
        }
    }

    return useQuery<TQueryFnData, TError, TData>({
        ...options,
        enabled: queryEnabled,
    });
};

const _extractQueryKey = (input: unknown): QueryKeyArray => toValue(input as ComputedRef<QueryKeyArray>);



/* Warning Logger Utilities */
const _warnedKeys = new Set<string>();
const _getCallerKey = (): string => {
    try {
        const err = new Error();
        const stack = err.stack?.split('\n') || [];

        const caller = stack.find((line, i) => i > 1
            && (line.includes('.ts') || line.includes('.vue'))
            && !line.includes('use-scoped-query'));

        return caller?.trim() ?? 'UNKNOWN_CALLSITE';
    } catch {
        return 'UNKNOWN_CALLSITE';
    }
};
const _warnOncePerTick = (log: () => boolean) => {
    const key = _getCallerKey();
    if (_warnedKeys.has(key)) return;
    const didLog = log();

    if (didLog) {
        _warnedKeys.add(key);
        queueMicrotask(() => _warnedKeys.delete(key));
    }
};
