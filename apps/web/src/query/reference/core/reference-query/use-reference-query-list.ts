import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { referenceQueryClient as queryClient } from '@/query/clients';
import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';
import { referenceConfigMap } from '@/query/reference/reference-config';
import type { ReferenceQueryParams, ReferenceQueryResponse } from '@/query/reference/types/reference-query-type';
import type { ReferenceFetchInfo, ReferenceKeyType } from '@/query/reference/types/reference-type';

export const useReferenceQueryList = <T>(
    resourceKey: ReferenceKeyType,
    fetchInfo: ReferenceFetchInfo<T>,
) => {
    const _config = referenceConfigMap[resourceKey];

    if (!_config) {
        throw new Error(`Invalid reference key - list : ${resourceKey}`);
    }

    const { withSuffix: referenceListQueryKey } = useReferenceQueryKey(resourceKey, 'list');

    const {
        listFetchFn,
        searchTargets = [_config.idKey, _config.nameKey],
        only = [_config.idKey, _config.nameKey],
        nameFormatter = (d: T) => d[_config.nameKey],
    } = fetchInfo;

    const _getListParams = (params: ReferenceQueryParams = {}) => {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([
            { k: _config.idKey, v: [null, ''], o: '!=' },
        ]);

        if (params.options) {
            Object.entries(params.options).forEach(([key, value]) => {
                apiQueryHelper.addFilter({ k: key, v: value, o: '=' });
            });
        }

        if (params.search) {
            const searchFilters = searchTargets.map((key) => ({
                k: key,
                v: params.search ?? '',
                o: '' as ConsoleFilterOperator,
            }));
            apiQueryHelper.setOrFilters(searchFilters);
        }
        if (params.start !== undefined && params.limit !== undefined) {
            apiQueryHelper.setPage(params.start, params.limit);
        }

        return {
            query: {
                only,
                ...apiQueryHelper.data,
            },
        };
    };


    const _convertToReferenceQueryList = (response: ListResponse<T>, params: ReferenceQueryParams): ReferenceQueryResponse<T> => {
        let more = false;
        if (params.start !== undefined && params.limit !== undefined && response.total_count !== undefined) {
            more = (params.start * params.limit) < response.total_count;
        }
        return {
            results: response.results ? response.results.map((d) => ({ key: d[_config.idKey], name: nameFormatter(d), data: d })) : [],
            more,
            title: _config.name,
        };
    };


    const listReferenceQuery = async (params: ReferenceQueryParams = {}): Promise<ReferenceQueryResponse<any>> => {
        const queryParams = _getListParams(params);
        const queryKey = referenceListQueryKey(queryParams);

        const data = await queryClient.ensureQueryData({
            queryKey,
            queryFn: () => listFetchFn(queryParams),
            staleTime: 1000 * 60 * 5,
        });

        return _convertToReferenceQueryList(data, params);
    };

    return {
        listReferenceQuery,
    };
};


