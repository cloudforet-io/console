import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useReportAdjustmentApi } from '@/api-clients/cost-analysis/report-adjustment/composables/use-report-adjustment-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

const reportAdjustmentApiHelper = new ApiQueryHelper().setSort('order', false);
export const useReportAdjustmentQuery = () => {
    const { reportAdjustmentAPI } = useReportAdjustmentApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'report-adjustment', 'list', {
        params: {
            query: reportAdjustmentApiHelper.data,
        },
    });
    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => reportAdjustmentAPI.list(params.value),
        select: (d) => d.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        reportAdjustmentList: data,
        isLoading,
        error,
    };
};
