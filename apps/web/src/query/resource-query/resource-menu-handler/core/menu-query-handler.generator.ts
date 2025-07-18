
import type { QueryClient } from '@tanstack/query-core';

import { getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { MenuAttachHandler } from '@cloudforet/mirinae';

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
            fixedFilters,
            searchTargets = [],
        } = fetchConfig;

        const _queryKeyWithSuffix = queryKeyWithSuffix;
        const _queryClient = queryClient;


        // Init and Set Default API Filters
        const _apiQueryHelper = new ApiQueryHelper();
        _apiQueryHelper.setFilters([{ k: idKey, v: [null, ''], o: '!=' }]);
        if (fixedFilters) {
            Object.entries(fixedFilters).forEach(([key, value]) => {
                _apiQueryHelper.addFilter({ k: key, v: value, o: '=' });
            });
        }
        const defaultFilters = _apiQueryHelper.filters;


        // Main Handler
        return async (inputText: string, pageStart = 1, pageLimit = 10): Promise<ResourceMenuResponse<TDataModel>> => {
            // Set Default Filters
            _apiQueryHelper.setFilters(defaultFilters);

            // Set Input Text Filters
            if (inputText) {
                searchTargets.forEach((key) => {
                    _apiQueryHelper.addFilter({
                        k: key,
                        v: inputText ?? '',
                        o: '' as ConsoleFilterOperator,
                    });
                });
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
            fixedFilters,
        } = fetchConfig;

        const _queryKeyWithSuffix = queryKeyWithSuffix;
        const _queryClient = queryClient;


        // Init and Set Default API Filters
        const _apiQueryHelper = new ApiQueryHelper();
        _apiQueryHelper.setFilters([{ k: distinct, v: [null, ''], o: '!=' }]);
        if (fixedFilters) {
            Object.entries(fixedFilters).forEach(([key, value]) => {
                _apiQueryHelper.addFilter({ k: key, v: value, o: '=' });
            });
        }
        const defaultFilters = _apiQueryHelper.filters;

        // Main Handler
        return async (inputText: string, pageStart = 1, pageLimit = 10, filters?: string[]): Promise<ResourceMenuResponse<string>> => {
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

