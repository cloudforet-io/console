import { useDataSourceAccountApi } from '@/api-clients/cost-analysis/data-source-account/composables/use-data-source-account-api';
import type { CostDataSourceAccountAnalyzeParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/analyze';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useDataSourceAccountAnalyzeQuery = (params: CostDataSourceAccountAnalyzeParameters) => {
    const { dataSourceAccountAPI } = useDataSourceAccountApi();
    const { key, params: queryParams } = useServiceQueryKey('cost-analysis', 'data-source-account', 'analyze', {
        params,
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => dataSourceAccountAPI.analyze(queryParams.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costDataSourceAccountAnalyzeData: data, isLoading, error,
    };
};
