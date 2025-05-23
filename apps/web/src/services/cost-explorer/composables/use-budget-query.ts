import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useBudgetApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-api';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

export const useBudgetQuery = (budgetId?: string) => {
    const { budgetAPI } = useBudgetApi();

    const { key: budgetListQueryKey, params: budgetListParams } = useServiceQueryKey('cost-analysis', 'budget', 'list');
    const { withSuffix: budgetGetQueryKey } = useServiceQueryKey('cost-analysis', 'budget', 'get');

    const budgetListQuery = useScopedQuery({
        queryKey: budgetListQueryKey,
        queryFn: () => budgetAPI.list(budgetListParams.value),
        select: (data) => data?.results ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: true,
    }, ['DOMAIN', 'WORKSPACE']);

    const budgetDataQuery = useScopedQuery({
        queryKey: budgetGetQueryKey(budgetId ?? ''),
        queryFn: () => budgetAPI.get({ budget_id: budgetId ?? '' }),
        select: (data) => data,
        initialData: undefined,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !!budgetId),
    }, ['DOMAIN', 'WORKSPACE']);

    const isLoading = computed<boolean>(() => budgetListQuery.isFetching.value);

    const queryClient = useQueryClient();

    const setQueryData = (newData: BudgetModel[]) => {
        queryClient.setQueryData([budgetListQueryKey.value], newData);
    };

    const invalidateBudgetListQuery = () => {
        queryClient.invalidateQueries({ queryKey: budgetListQueryKey.value });
    };

    const refetchBudgetListQuery = () => {
        queryClient.refetchQueries({ queryKey: budgetListQueryKey.value });
    };


    return {
        budgetList: computed<BudgetModel[]|any>(() => (budgetListQuery.data.value ?? [])),
        budgetData: computed<BudgetModel|any>(() => (budgetDataQuery.data.value ?? {})),
        isLoading,
        budgetListQueryKey,
        budgetAPI,
        setQueryData,
        budgetGetQueryKey,
        invalidateBudgetListQuery,
        queryClient,
        refetchBudgetListQuery,
    };
};
