import type { Ref } from 'vue';

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useCostReportConfigQuery = (ops?: { enabled: Ref<boolean> }) => {
    const { costReportConfigAPI } = useCostReportConfigApi();
    const { key: costReportConfigQueryKey, params } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list', {
    });
    const { data, isLoading, error } = useScopedQuery({
        queryKey: costReportConfigQueryKey,
        queryFn: async () => {
            const res = await costReportConfigAPI.list(params.value);
            return res.results?.[0] ?? null;
        },
        enabled: ops?.enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data, isLoading, error,
    };
};
