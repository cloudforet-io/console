import { computed } from 'vue';

import type { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useCostApi } from '@/api-clients/cost-analysis/cost/composables/use-cost-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


export const useCostAnalysisQuery = (data_source_id: string, query: ApiQueryHelper) => {
    const { costAPI } = useCostApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost', 'analyze', {
        params: computed(() => ({
            data_source_id,
            query: query.data,
        })),
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costAPI.analyze(params.value),
        select: (d) => d.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costAnalysisData: data, isLoading, error,
    };
};
