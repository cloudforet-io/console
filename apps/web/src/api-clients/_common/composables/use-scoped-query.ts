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
 * - Runs queries only when **the user’s scope is valid** and the app is **ready**.
 * - Uses Vue’s **reactivity** to dynamically compute the `enabled` state.
 * - Supports both **static and reactive `enabled` values**.
 *
 * ## Parameters:
 * - `options`: Standard **Vue Query options** (`UseQueryOptions`).
 * - `requiredScopes`: A list of **required grant scopes** to determine if the query should execute.
 *
 * ## Supported Query Options:
 * The following options are commonly used within our team:
 * - `queryKey`: **Unique key** to identify the query in the cache.
 * - `queryFn`: **Function** to fetch data from the API.
 * - `select`: **Transform function** to modify response data.
 * - `initialData`: **Default value** for the query when no data is available.
 * - `staleTime`: **Cache duration** before the query becomes stale.
 * - `enabled`: **Boolean or reactive ref** to control when the query should execute.
 *
 * ## Example Usage:
 *
 * const myQuery = useScopedQuery({
 *   queryKey: ['dashboard', dashboardId],
 *   queryFn: () => fetchDashboardData(dashboardId),
 *   select: (data) => data.results,
 *   initialData: { results: [] },
 *   staleTime: 1000 * 60 * 5, // 5 minutes
 *   enabled: computed(() => isUserAuthorized.value),
 * }, ['DOMAIN', 'WORKSPACE']);
 *
 */


import type { MaybeRef } from '@vueuse/core';
import { toValue } from '@vueuse/core';
import { computed, reactive } from 'vue';

import type {
    UseQueryOptions,
} from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import type { GrantScope } from '@/schema/identity/token/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

export const useScopedQuery = <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
    options: UseQueryOptions<TQueryFnData, TError, TData>,
    requiredScopes: GrantScope[] = [],
) => {
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();

    const _state = reactive({
        currentGrantScope: computed<GrantScope>(() => userStore.state.currentGrantInfo?.scope || 'USER'),
        isLoading: computed(() => appContextStore.getters.globalGrantLoading),
        isValidScope: computed(() => requiredScopes.includes(_state.currentGrantScope)),
    });

    const queryEnabled = computed<boolean>(() => {
        const _inheritedEnabled = options?.enabled as MaybeRef<boolean> | undefined;
        if (_inheritedEnabled !== undefined && !toValue(_inheritedEnabled)) return false;
        return _state.isValidScope && !_state.isLoading;
    });

    return useQuery<TQueryFnData, TError, TData>({
        ...options,
        enabled: queryEnabled,
    });
};
