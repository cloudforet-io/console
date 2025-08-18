import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { isEmpty } from 'lodash';

import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

import { useUnifiedCostApi } from '@/api-clients/cost-analysis/unified-cost/composables/use-unified-cost-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useUnifiedCostAnalyzeQuery = ({
    query,
}: {
    query: ComputedRef<AnalyzeQuery>;
}) => {
    const { unifiedCostAPI } = useUnifiedCostApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'unified-cost', 'analyze', {
        params: computed(() => ({
            query: query.value,
        })),
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => unifiedCostAPI.analyze(params.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        enabled: computed(() => !isEmpty(query.value)),
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costAnalyzeData: data, isLoading, error,
    };
};
