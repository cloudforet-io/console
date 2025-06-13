import type { ComputedRef } from 'vue';
import {
    computed, watch,
} from 'vue';

import type { InfiniteData } from '@tanstack/vue-query';
import { type UseInfiniteQueryOptions } from '@tanstack/vue-query';

import type { GrantScope } from '@/api-clients/identity/token/schema/type';
import { useScopedInfiniteQuery } from '@/query/composables/use-scoped-infinite-query';
import { addPageToVerbParams } from '@/query/pagination/pagination-query-helper';
import type { QueryKeyArray } from '@/query/query-key/types/query-key-type';


/**
 * useScopedPaginationQuery
 *
 * A wrapper around `useInfiniteQuery` for paginated resource fetching with consistent queryKey and page parameter handling.
 * Automatically appends page params (start, limit) to the query function based on the API verb structure.
 * Supports dynamic fetching of missing pages based on the `thisPage` value.
 *
 * @template TParams - API parameter type (excluding page info)
 * @template TPageData - Response data type, must include `results` and `total_count`
 * @template TError - Optional error type
 *
 * @param options - Query config including:
 *  - queryFn: the fetcher function (expects page-added params)
 *  - params: the base API params (as a ComputedRef)
 *  - initialPageParam: (optional) starting page index, default is 1
 *  - ...restOptions: all other `useInfiniteQuery` options (except those overridden)
 *
 * @param pageOptions - Pagination control:
 *  - thisPage: current page number (1-based)
 *  - pageSize: number of items per page
 *  - verb: one of 'list' | 'stat' | 'analyze' | 'load' (used to insert page info in correct param structure)
 *
 * @param requiredScopes - A list of **required grant scopes** to determine if the query should execute.
 *
 *
* @returns {
*   data: ComputedRef<TPageData | undefined> - Data for the current page (1-based index)
*   totalCount: ComputedRef<number> - Total number of items (from first page)
*   isReady: ComputedRef<boolean> - Whether the current page is loaded
*   isLoading: ComputedRef<boolean> - Whether the current page is being fetched
*   query: Return value of useScopedInfiniteQuery - includes all raw query states
* }
*/

type PaginatableBaseData = {
    results?: any[];
    total_count?: number;
};

type UsePaginationQueryOptions<TParams extends object, TPageData, TError> = Omit<
    UseInfiniteQueryOptions<TPageData, TError, InfiniteData<TPageData>, TPageData, QueryKeyArray, number>,
    'initialPageParam' | 'queryFn' | 'getNextPageParam'
> & {
    queryFn: (params: TParams) => Promise<TPageData>;
    params: ComputedRef<TParams>;
    initialPageParam?: number;
};

interface UsePaginationQueryPageOptions {
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    verb: 'list' | 'stat' | 'analyze' | 'load';
}

export const useScopedPaginationQuery = <TParams extends object, TPageData extends PaginatableBaseData, TError = unknown>(
    options: UsePaginationQueryOptions<TParams, TPageData, TError>,
    pageOptions: UsePaginationQueryPageOptions,
    requiredScopes: [GrantScope, ...GrantScope[]],
) => {
    const { thisPage, pageSize, verb } = pageOptions;
    const {
        queryFn, params, initialPageParam = 1, ...restOptions
    } = options;


    // Wraps the queryFn to inject pagination params (start, limit) into correct structure based on verb.
    // For example:
    // - 'load': params.page = { start, limit }
    // - 'list': params.query.page = { start, limit }
    const wrappedQueryFn = ({ pageParam }: { pageParam: number }) => queryFn(addPageToVerbParams(verb, params.value, {
        start: pageParam,
        limit: pageSize.value,
    }));


    const query = useScopedInfiniteQuery<TPageData, TError, InfiniteData<TPageData>, QueryKeyArray, number>({
        ...restOptions,
        queryFn: wrappedQueryFn,
        initialPageParam,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((acc, page) => acc + (page?.results?.length || 0), 0);
            return loadedCount < (lastPage?.total_count || 0) ? loadedCount + 1 : undefined;
        },
        // getPreviousPageParam: (firstPage, allPages) => {
        //     const prevStart = allPages[0]?.results?.length ?? 0;
        //     return prevStart > 1 ? Math.max(1, prevStart - pageSize.value) : undefined;
        // },
    }, requiredScopes);

    // Watches the `thisPage` ref and automatically fetches all pages up to that index
    // Ensures that the page requested by the consumer is available in the data list
    watch(thisPage, async (val) => {
        const currentLength = query.data.value?.pages?.length ?? 0;
        if (val > currentLength && !query.isFetchingNextPage.value) {
            const calls = Array.from({ length: val - currentLength });
            await Promise.all(calls.map(() => query.fetchNextPage()));
        }
    });

    return {
        data: computed(() => query.data.value?.pages?.[thisPage.value - 1]),
        totalCount: computed(() => query.data.value?.pages?.[0]?.total_count ?? 0),
        isReady: computed(() => !!query.data.value?.pages?.[thisPage.value - 1]),
        isLoading: computed(() => !query.data.value?.pages?.[thisPage.value - 1] && query.isFetchingNextPage.value),
        query,
    };
};
