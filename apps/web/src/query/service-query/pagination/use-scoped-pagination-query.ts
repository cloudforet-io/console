import type { ComputedRef } from 'vue';
import {
    computed, watch,
} from 'vue';

import type { InfiniteData } from '@tanstack/vue-query';
import { useQueryClient, type UseInfiniteQueryOptions } from '@tanstack/vue-query';

import type { GrantScope } from '@/api-clients/identity/token/schema/type';
import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import { useScopedInfiniteQuery } from '@/query/service-query/use-scoped-infinite-query';
import type { PaginatableBaseData } from '@/query/shared/types/pagination-type';
import { addPageToVerbParams } from '@/query/shared/utils/pagination-query-helper';


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
 *  - verb: one of 'list' | 'load' (used to insert page info in correct param structure)
 *
 * @param requiredScopes - A list of **required grant scopes** to determine if the query should execute.
 *
 *
* @returns {
*   data: ComputedRef<TPageData | undefined> - Data for the current page (1-based index)
*   totalCount: ComputedRef<number> - Total number of items (from first page, except for 'analyze' verb)
*   isReady: ComputedRef<boolean> - Whether the current page is loaded
*   isLoading: ComputedRef<boolean> - Whether the current page is being fetched
*   query: Return value of useScopedInfiniteQuery - includes all raw query states
* }
*/

type UsePaginationQueryOptions<TParams extends object, TPageData, TError> = Omit<
    UseInfiniteQueryOptions<TPageData, TError, InfiniteData<TPageData>, TPageData, QueryKeyArray, number>,
    'initialPageParam' | 'queryFn' | 'getNextPageParam' | 'select'
> & {
    queryKey: ComputedRef<QueryKeyArray>
    queryFn: (params: TParams) => Promise<TPageData>;
    params: ComputedRef<TParams>;
    initialPageParam?: number;
};

interface UsePaginationQueryPageOptions {
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
    verb: 'list' | 'load' | 'get-data' | 'analyze' | 'find' | 'stat';
}

export const useScopedPaginationQuery = <TParams extends object, TPageData extends PaginatableBaseData, TError = unknown>(
    options: UsePaginationQueryOptions<TParams, TPageData, TError>,
    pageOptions: UsePaginationQueryPageOptions,
    requiredScopes: [GrantScope, ...GrantScope[]],
) => {
    const queryClient = useQueryClient();
    const { thisPage, pageSize, verb = 'list' } = pageOptions;
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
            if (verb === 'analyze') return lastPage?.more ? loadedCount + 1 : undefined;
            return loadedCount < (lastPage?.total_count || 0) ? loadedCount + 1 : undefined;
        },
    }, requiredScopes);

    // Watches the `thisPage` ref and automatically fetches all pages up to that index
    // Ensures that the page requested by the consumer is available in the data list
    const fetchUntilPageLoaded = (targetPage: number) => {
        const current = query.data.value?.pages?.length ?? 0;

        if (current >= targetPage) return;

        if (!query.isFetchingNextPage.value) {
            query.fetchNextPage().then(() => {
                setTimeout(() => fetchUntilPageLoaded(targetPage), 0);
            });
        } else {
            setTimeout(() => fetchUntilPageLoaded(targetPage), 50);
        }
    };

    watch(thisPage, (val) => {
        fetchUntilPageLoaded(val);
    });

    // Clear cached pages when page size changes to avoid inconsistent pagination data
    watch(pageSize, () => {
        queryClient.resetQueries({ queryKey: options.queryKey.value });
    });

    return {
        data: computed(() => query.data.value?.pages?.[thisPage.value - 1]),
        totalCount: computed(() => query.data.value?.pages?.[0]?.total_count ?? 0), // except for 'analyze' verb
        more: computed(() => query.data.value?.pages?.[thisPage.value - 1]?.more ?? false), // for 'analyze' verb without 'total_count'
        isReady: computed(() => !!query.data.value?.pages?.[thisPage.value - 1]),
        isLoading: computed(() => !query.data.value?.pages?.[thisPage.value - 1] && query.isFetchingNextPage.value),
        query,
    };
};
