import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { referenceQueryClient as queryClient } from '@/query/clients';
import { useReferenceQueryKey } from '@/query/core/query-key/use-reference-query-key';
import { referenceConfigMap } from '@/query/reference/reference-config';
import type { ReferenceQueryParams, ReferenceQueryResponse } from '@/query/reference/types/reference-query-type';
import type { ReferenceFetchInfo, ReferenceKeyType } from '@/query/reference/types/reference-type';

export const useReferenceQueryStat = <T>(
    resourceKey: ReferenceKeyType,
    fetchInfo: ReferenceFetchInfo<T>,
) => {
    if (!referenceConfigMap[resourceKey]) {
        throw new Error(`Invalid reference key - stat : ${resourceKey}`);
    }

    const { withSuffix: referenceStatQueryKey } = useReferenceQueryKey(resourceKey, 'stat');

    const {
        statFetchFn,
    } = fetchInfo;

    const _getStatParams = (params: ReferenceQueryParams = {}, dataKey: string) => {
        const apiQueryHelper = new ApiQueryHelper();

        // Additional Filter (ex. data_source_id)
        if (params.options) {
            apiQueryHelper.setFilters([]);
            Object.entries(params.options).forEach(([key, value]) => {
                apiQueryHelper.addFilter({ k: key, v: value, o: '=' });
            });
            apiQueryHelper.addFilter({ k: dataKey, v: [null, ''], o: '!=' });
        } else {
            apiQueryHelper.setFilters([
                { k: dataKey, v: [null, ''], o: '!=' },
            ]);
        }


        if (params.search) {
            apiQueryHelper.addFilter({ k: dataKey, v: params.search, o: '' });
        }
        if (params.filters) {
            apiQueryHelper.addFilter({ k: dataKey, v: params.filters, o: '=' });
        }

        if (params.start !== undefined && params.limit !== undefined) {
            apiQueryHelper.setPage(params.start, params.limit);
        }

        return {
            query: {
                distinct: dataKey,
                ...apiQueryHelper.data,
            },
        };
    };

    const _convertToReferenceQueryStat = (response: ListResponse<any>, params: ReferenceQueryParams, dataKey: string): ReferenceQueryResponse<any> => {
        let more = false;
        if (params.start !== undefined && params.limit !== undefined && response.total_count !== undefined) {
            more = (params.start - 1 + params.limit) < response.total_count;
        }

        return {
            results: (response.results ?? []).map((d) => ({ key: d, name: d, data: d })),
            more,
            title: dataKey,
        };
    };

    const statReferenceQuery = (dataKey: string) => {
        const _dataKey = dataKey;
        return async (params: ReferenceQueryParams = {}): Promise<ReferenceQueryResponse<any>> => {
            if (!statFetchFn) {
                console.warn('This resource does not support stat fetch');
                return { results: [], more: false };
            }
            const queryParams = _getStatParams(params, _dataKey);
            const queryKey = referenceStatQueryKey(queryParams);

            const data = await queryClient.ensureQueryData({
                queryKey,
                queryFn: () => statFetchFn(queryParams),
                staleTime: 1000 * 60 * 5,
            });

            return _convertToReferenceQueryStat(data, params, dataKey);
        };
    };


    return {
        statReferenceQuery,
    };
};


