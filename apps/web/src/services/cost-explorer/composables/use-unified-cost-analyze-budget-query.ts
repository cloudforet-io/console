import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { isEmpty } from 'lodash';

import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

import { useUnifiedCostApi } from '@/api-clients/cost-analysis/unified-cost/composables/use-unified-cost-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';

export const useUnifiedCostAnalyzeBudgetQuery = ({
    query,
}: {
    query: ComputedRef<AnalyzeQuery>;
}) => {
    const budgetCreatePageStore = useBudgetCreatePageStore();
    const budgetCreatePageState = budgetCreatePageStore.state;

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
        enabled: computed(() => {
            // start date is not empty and end date is empty (block 500 error)
            const { startMonth, endMonth } = budgetCreatePageState;
            const hasStart = !!startMonth && String(startMonth).length > 0;
            const hasEnd = !!endMonth && String(endMonth).length > 0;
            const shouldBlock = hasStart && !hasEnd;
            return !isEmpty(query.value) && !shouldBlock;
        }),
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costAnalyzeData: data, isLoading, error, costAnalyzeQueryKey: key,
    };
};
