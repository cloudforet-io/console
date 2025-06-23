import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useBudgetApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-api';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const STALE_TIME = 1000 * 60 * 5;

export const useBudgetGetQuery = (budgetId: ComputedRef<string>) => {
    const { budgetAPI } = useBudgetApi();

    const { key: budgetGetQueryKey, params: budgetGetQueryParams } = useServiceQueryKey('cost-analysis', 'budget', 'get', {
        params: computed(() => ({
            budget_id: budgetId.value,
        })),
    });

    const budgetDataQuery = useScopedQuery({
        queryKey: budgetGetQueryKey,
        queryFn: () => budgetAPI.get(budgetGetQueryParams.value),
        select: (data) => data,
        initialData: undefined,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !!budgetId.value),
    }, ['DOMAIN', 'WORKSPACE']);

    const isFetching = computed<boolean>(() => budgetDataQuery.isFetching.value);

    const queryClient = useQueryClient();

    const setQueryData = (newData: BudgetModel) => {
        queryClient.setQueryData([budgetGetQueryKey], newData);
    };

    const invalidateBudgetGetQuery = () => {
        queryClient.invalidateQueries({ queryKey: budgetGetQueryKey });
    };

    return {
        budgetAPI,
        budgetData: computed<BudgetModel|any>(() => (budgetDataQuery.data.value ?? {})),
        isFetching,
        budgetGetQueryKey,
        setQueryData,
        invalidateBudgetGetQuery,
        queryClient,
    };
};
