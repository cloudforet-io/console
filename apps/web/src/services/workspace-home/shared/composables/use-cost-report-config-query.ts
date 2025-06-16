import type { Ref } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


const costReportConfigApiHelper = new ApiQueryHelper().setSort('created_at', true);
export const useCostReportConfigQuery = ({
    enabled,
}: {
    enabled: Ref<boolean>;
}) => {
    const { costReportConfigAPI } = useCostReportConfigApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list', {
        params: {
            query: {
                ...costReportConfigApiHelper.data,
                sort: [{ key: 'created_at', desc: false }],
            },
        },
    });
    const { data } = useScopedQuery({
        queryKey: key,
        queryFn: () => costReportConfigAPI.list(params.value),
        select: (d) => d.results?.[0],
        enabled,
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 1 day
    }, ['WORKSPACE']);

    return {
        costReportConfig: data,
    };
};
