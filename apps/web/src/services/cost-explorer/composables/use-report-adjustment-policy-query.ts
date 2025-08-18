import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useReportAdjustmentPolicyApi } from '@/api-clients/cost-analysis/report-adjustment-policy/composables/use-report-adjustment-policy-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

const reportAdjustmentPolicyApiHelper = new ApiQueryHelper().setSort('order', false);
export const useReportAdjustmentPolicyQuery = () => {
    const { reportAdjustmentPolicyAPI } = useReportAdjustmentPolicyApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'report-adjustment-policy', 'list', {
        params: {
            query: reportAdjustmentPolicyApiHelper.data,
        },
    });
    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => reportAdjustmentPolicyAPI.list(params.value),
        select: (d) => d.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        reportAdjustmentPolicyList: data,
        isLoading,
        error,
    };
};
