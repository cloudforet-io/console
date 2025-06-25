import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { isEmpty } from 'lodash';

import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

import { useCostReportDataApi } from '@/api-clients/cost-analysis/cost-report-data/composables/use-cost-report-data-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useCostReportDataAnalyzeQuery = ({
    cost_report_config_id,
    is_confirmed,
    query,
}: {
    cost_report_config_id?: ComputedRef<string>;
    is_confirmed?: boolean;
    query: ComputedRef<AnalyzeQuery | null>;
}, isUserScope = false) => {
    const { costReportDataAPI } = useCostReportDataApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-report-data', 'analyze', {
        params: computed(() => {
            const baseParams: any = {
                query: query?.value,
            };

            if (cost_report_config_id?.value) {
                baseParams.cost_report_config_id = cost_report_config_id.value;
            }

            if (is_confirmed !== undefined) {
                baseParams.is_confirmed = is_confirmed;
            }

            return baseParams;
        }),
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costReportDataAPI.analyze(params.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        enabled: computed(() => !isEmpty(query.value)),
    }, isUserScope ? ['USER'] : ['DOMAIN', 'WORKSPACE']);

    return {
        costReportDataAnalyzeData: data, isLoading, error,
    };
};
