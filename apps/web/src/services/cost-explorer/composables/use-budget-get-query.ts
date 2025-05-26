import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useBudgetApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-api';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const STALE_TIME = 1000 * 60 * 5;

export const useBudgetGetQuery = (budgetId: string) => {
    const { budgetAPI } = useBudgetApi();

    const { withSuffix: budgetGetQueryKey } = useServiceQueryKey('cost-analysis', 'budget', 'get');

    const budgetDataQuery = useScopedQuery({
        queryKey: budgetGetQueryKey(budgetId),
        queryFn: () => budgetAPI.get({ budget_id: budgetId }),
        select: (data) => data,
        initialData: undefined,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !!budgetId),
    }, ['DOMAIN', 'WORKSPACE']);

    const isLoading = computed<boolean>(() => budgetDataQuery.isFetching.value);

    const queryClient = useQueryClient();

    const setQueryData = (newData: BudgetModel) => {
        queryClient.setQueryData([budgetGetQueryKey(budgetId)], newData);
    };

    const invalidateBudgetGetQuery = () => {
        queryClient.invalidateQueries({ queryKey: budgetGetQueryKey(budgetId) });
    };

    return {
        budgetAPI,
        budgetData: computed<BudgetModel|any>(() => (budgetDataQuery.data.value ?? {})),
        isLoading,
        budgetGetQueryKey,
        setQueryData,
        invalidateBudgetGetQuery,
        queryClient,
    };
};
