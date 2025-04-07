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
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import {
    useQuery, type UseQueryOptions, type UseQueryReturnType,
} from '@tanstack/vue-query';

import type { GrantScope } from '@/api-clients/identity/token/schema/type';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';


type ScopedEnabled = MaybeRef<boolean>;


export const useScopedQuery = <TQueryFnData, TError = unknown, TData = TQueryFnData>(
    options: UseQueryOptions<TQueryFnData, TError, TData>,
    requiredScopes: [GrantScope, ...GrantScope[]],
): UseQueryReturnType<TData, TError> => {
    // Warns if `requiredScopes` array is missing or empty during development
    if (import.meta.env.DEV) {
        _warnMissingRequiredScopes(requiredScopes);
    }

    const appContextStore = useAppContextStore();
    const userStore = useUserStore();

    const currentGrantScope = computed<GrantScope | undefined>(
        () => userStore.state.currentGrantInfo?.scope,
    );
    const isAppReady = computed(() => appContextStore.getters.globalGrantLoading);

    const isValidScope = computed(() => currentGrantScope.value !== undefined
        && requiredScopes.includes(currentGrantScope.value));

    const rawEnabled = (options as { enabled?: ScopedEnabled }).enabled;
    const queryEnabled = computed(() => {
        const inheritedEnabled = rawEnabled !== undefined ? toValue(rawEnabled) : true;
        return inheritedEnabled && isValidScope.value && isAppReady.value;
    });

    // Logs a warning once per queryKey when the current scope is invalid for this query
    if (import.meta.env.DEV) {
        _warnInvalidScopeOnce({
            queryKey: _extractQueryKey((options as any).queryKey),
            enabled: toValue(queryEnabled),
            currentScope: currentGrantScope.value,
            requiredScopes,
            isAppReady: isAppReady.value,
        });
    }

    return useQuery<TQueryFnData, TError, TData>({
        ...options,
        enabled: queryEnabled,
    });
};

const _extractQueryKey = (input: unknown): QueryKeyArray => toValue(input as ComputedRef<QueryKeyArray>);

const _warnedKeys = new Set<string>();

function _warnMissingRequiredScopes(scopes: GrantScope[]) {
    if (import.meta.env.DEV && (!scopes || scopes.length === 0)) {
        console.warn('[useScopedQuery] `requiredScopes` is missing or empty.', {
            suggestion: 'Pass at least one valid scope like [\'DOMAIN\'], [\'WORKSPACE\'], etc.',
        });
    }
}

function _warnInvalidScopeOnce(params: {
    queryKey: QueryKeyArray;
    enabled: boolean;
    currentScope: GrantScope | undefined;
    requiredScopes: GrantScope[];
    isAppReady: boolean;
}) {
    if (!import.meta.env.DEV) return;

    const {
        queryKey, enabled, currentScope, requiredScopes, isAppReady,
    } = params;
    if (!enabled || !isAppReady || !currentScope) return;

    if (requiredScopes.includes(currentScope)) return;

    const key = Array.isArray(queryKey)
        ? queryKey.join(':')
        : String(queryKey);

    if (_warnedKeys.has(key)) return;

    _warnedKeys.add(key);

    console.warn('[useScopedQuery] Query not executed due to invalid grant scope.', {
        queryKey,
        currentScope,
        requiredScopes,
    });
}
