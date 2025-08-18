import { computed, type ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useBudgetApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-api';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseBudgetListPaginationQueryOptions {
    params: ComputedRef<BudgetListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useBudgetListPaginationQuery = ({ params, thisPage, pageSize }: UseBudgetListPaginationQueryOptions) => {
    const queryClient = useQueryClient();

    const { budgetAPI } = useBudgetApi();

    const { key: budgetListPaginationQueryKey, params: budgetListPaginationQueryParams } = useServiceQueryKey('cost-analysis', 'budget', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const query = useScopedPaginationQuery({
        queryKey: budgetListPaginationQueryKey,
        queryFn: budgetAPI.list,
        params: budgetListPaginationQueryParams,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: budgetListPaginationQueryKey.value });
    };

    return {
        data: computed<BudgetModel[]>(() => query.data.value?.results || []),
        totalCount: query.totalCount,
        isLoading: query.isLoading,
        refresh,
    };
};
