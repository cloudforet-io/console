import type { ComputedRef } from 'vue';
import { computed, type Ref } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useBudgetApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-api';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseBudgetListQueryReturn {
    budgetListData: Ref<BudgetModel[]>;
    budgetListIsLoading: Ref<boolean>;
    budgetListQueryKey: Ref<QueryKey>;
    budgetListQueryParams: Ref<BudgetListParameters>;
    refetchBudgetList: () => Promise<unknown>;
}

export const useBudgetListQuery = (params?: Ref<BudgetListParameters> | ComputedRef<BudgetListParameters>): UseBudgetListQueryReturn => {
    const { budgetAPI } = useBudgetApi();

    const { key: budgetListQueryKey, params: budgetListQueryParams } = useServiceQueryKey('cost-analysis', 'budget', 'list', {
        params: computed(() => params?.value ?? {}),
    });

    const { data: budgetListData, isFetching, refetch } = useScopedQuery({
        queryKey: budgetListQueryKey,
        queryFn: () => budgetAPI.list(budgetListQueryParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 30,
        enabled: true,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        budgetListData: computed<BudgetModel[]>(() => budgetListData.value ?? []),
        budgetListIsLoading: isFetching,
        budgetListQueryKey,
        budgetListQueryParams,
        refetchBudgetList: refetch,
    };
};
