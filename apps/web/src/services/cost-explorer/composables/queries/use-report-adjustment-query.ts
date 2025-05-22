import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useReportAdjustmentApi } from '@/api-clients/cost-analysis/report-adjustment/composables/use-report-adjustment-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

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
