import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCostReportApi } from '@/api-clients/cost-analysis/cost-report/composables/use-cost-report-api';
import type { CostReportGetParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/get';
import type { CostReportModel } from '@/api-clients/cost-analysis/cost-report/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useCostReportGetQuery = (costReportId: ComputedRef<string | undefined>) => {
    const { costReportAPI } = useCostReportApi();

    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-report', 'get', {
        contextKey: costReportId,
        params: computed<CostReportGetParameters>(() => ({
            cost_report_id: costReportId.value as string,
        })),
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costReportAPI.get(params.value),
        select: (d) => d,
        enabled: computed(() => !!costReportId.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costReport: data as ComputedRef<CostReportModel | undefined>,
        isLoading,
        error,
    };
};
