import type { Ref } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const dataSourceApiHelper = new ApiQueryHelper().setSort('workspace_id', false);

export const useCostDataSourceQuery = (ops?: {
    enabled?: Ref<boolean>;
}) => {
    const { enabled } = ops ?? {};
    const { dataSourceAPI } = useDataSourceApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'data-source', 'list', {
        params: {
            query: dataSourceApiHelper.data,
        },
    });
    const { data, isLoading } = useScopedQuery({
        queryKey: key,
        queryFn: () => dataSourceAPI.list(params.value),
        select: (d) => d.results ?? [],
        enabled,
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 1 day
    }, ['WORKSPACE']);

    return {
        dataSource: data,
        loadingDataSource: isLoading,
    };
};
