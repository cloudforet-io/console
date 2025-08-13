
import type { QueryClient } from '@tanstack/query-core';

import { getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import type { ConsoleFilter, ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { MenuAttachHandler } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { QueryKeyWithSuffix } from '@/query/core/query-key/types/query-key-type';
import type {
    ResourceMenuResponse,
} from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler';
import type { ResourceMenuHandlerListFetchConfig, ResourceMenuHandlerStatFetchConfig } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.port';



export const generateMenuQueryHandler = (
    queryClient: QueryClient,
) => {
    // List Menu Handler
    const makeListMenuHandler = <TDataModel extends Record<string, any> = Record<string, any>>
        (queryKeyWithSuffix: QueryKeyWithSuffix, fetchConfig: ResourceMenuHandlerListFetchConfig<TDataModel>): MenuAttachHandler => {
        const {
            fetcher,
            idKey,
            only,
            menuFilters,
            searchTargets = [],
        } = fetchConfig;

        const _queryKeyWithSuffix = queryKeyWithSuffix;
        const _queryClient = queryClient;


        // Init and Set Default API Filters
        const _defaultApiQueryHelper = new ApiQueryHelper();

        const defaultMenuFilters:ConsoleFilter[] = [{ k: idKey, v: [null, ''], o: '!=' }];

        if (menuFilters) {
            defaultMenuFilters.push(...menuFilters);
        }
        _defaultApiQueryHelper.setFilters(defaultMenuFilters);

        const defaultFilters = _defaultApiQueryHelper.filters;


        // Main Handler
        return async (inputText: string, pageStart = 1, pageLimit = 10, filters?: MenuItem[]): Promise<ResourceMenuResponse<TDataModel>> => {
            const _apiQueryHelper = new ApiQueryHelper();
            // Set Default Filters
            _apiQueryHelper.setFilters(defaultFilters);

            // Set Input Text Filters
            if (inputText) {
                const searchFilters = searchTargets.map((key) => ({
                    k: key,
                    v: inputText ?? '',
                    o: '' as ConsoleFilterOperator,
                }));
                _apiQueryHelper.setOrFilters(searchFilters);
            }

            // Set Additional Filters
            if (filters) {
                _apiQueryHelper.addOrFilter({ k: idKey, v: filters.map((d) => d.name as string), o: '=' });
            }

            // Set API Params
            const _params = {
                query: {
                    ..._apiQueryHelper.data,
                    only: only ?? undefined,
                    page: {
                        start: pageStart,
                        limit: pageLimit,
                    },
                },
            };

            // Get Query Key
            const queryKey = _queryKeyWithSuffix(_params);

            // Get Query Data
            const query = await _queryClient.ensureQueryData({
                queryKey,
                queryFn: () => fetcher(_params),
                staleTime: 1000 * 60 * 5,
                gcTime: 1000 * 60 * 10,
            });

            // Get More Flag
            const thisPage = getThisPage(pageStart, pageLimit);
            const more = thisPage * pageLimit < (query.total_count || 0);

            // Return Results
            return {
                results: (query.results || [])?.map((item) => ({
                    name: item[idKey] as string,
                    label: item.name as string,
                    data: item,
                })),
                more,
            };
        };
    };

    // Stat Menu Handler
    const makeStatMenuHandler = (queryKeyWithSuffix: QueryKeyWithSuffix, fetchConfig: ResourceMenuHandlerStatFetchConfig): MenuAttachHandler<any> => {
        const {
            fetcher,
            distinct,
            menuFilters,
        } = fetchConfig;

        const _queryKeyWithSuffix = queryKeyWithSuffix;
        const _queryClient = queryClient;


        // Init and Set Default API Filters
        const _defaultApiQueryHelper = new ApiQueryHelper();

        const defaultMenuFilters:ConsoleFilter[] = [{ k: distinct, v: [null, ''], o: '!=' }];

        if (menuFilters) {
            defaultMenuFilters.push(...menuFilters);
        }
        _defaultApiQueryHelper.setFilters(defaultMenuFilters);

        const defaultFilters = _defaultApiQueryHelper.filters;

        // Main Handler
        return async (inputText: string, pageStart = 1, pageLimit = 10, filters?: string[]): Promise<ResourceMenuResponse<string>> => {
            const _apiQueryHelper = new ApiQueryHelper();
            // Set Default Filters
            _apiQueryHelper.setFilters(defaultFilters);

            // Set Input Text Filters
            if (inputText) {
                _apiQueryHelper.addFilter({ k: distinct, v: inputText, o: '' });
            }

            // Set Additional Filters
            if (filters) {
                _apiQueryHelper.addFilter({ k: distinct, v: filters, o: '=' });
            }

            // Set API Params
            const _params = {
                query: {
                    ..._apiQueryHelper.data,
                    distinct,
                    page: {
                        start: pageStart,
                        limit: pageLimit,
                    },
                },
            };

            // Get Query Key
            const queryKey = _queryKeyWithSuffix(_params);

            // Get Query Data
            const query = await _queryClient.ensureQueryData({
                queryKey,
                queryFn: () => fetcher(_params),
                staleTime: 1000 * 60 * 5,
                gcTime: 1000 * 60 * 10,
            });

            // Get More Flag
            const thisPage = getThisPage(pageStart, pageLimit);
            const more = thisPage * pageLimit < (query.total_count || 0);

            // Return Results
            return {
                results: (query.results || [])?.map((item) => ({
                    name: item,
                    label: item,
                    data: item,
                })),
                more,
            };
        };
    };

    return {
        makeListMenuHandler,
        makeStatMenuHandler,
    };
};

