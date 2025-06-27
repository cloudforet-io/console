import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

const costReportConfigApiHelper = new ApiQueryHelper().setSort('created_at', false);
export const useCostReportConfigQuery = () => {
    const { costReportConfigAPI } = useCostReportConfigApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list', {
        params: {
            query: {
                ...costReportConfigApiHelper.data,
            },
        },
    });
    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costReportConfigAPI.list(params.value),
        select: (d) => d.results?.[0] ?? null,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costReportConfig: data, isLoading, error,
    };
};
