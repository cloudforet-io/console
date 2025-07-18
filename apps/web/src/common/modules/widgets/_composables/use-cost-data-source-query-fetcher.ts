
import { useQueryClient } from '@tanstack/vue-query';

import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';


export const useCostDataSourceQueryFetcher = () => {
    const { dataSourceAPI } = useDataSourceApi();
    const queryClient = useQueryClient();
    const { withSuffix: costDataSourceQueryKey } = useServiceQueryKey('cost-analysis', 'data-source', 'get');

    const getCostDataSource = async (costDataSourceId: string) => queryClient.fetchQuery({
        queryKey: costDataSourceQueryKey([costDataSourceId, { data_source_id: costDataSourceId }]),
        queryFn: () => dataSourceAPI.get({ data_source_id: costDataSourceId }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 3,
    });

    return {
        getCostDataSource,
    };
};
