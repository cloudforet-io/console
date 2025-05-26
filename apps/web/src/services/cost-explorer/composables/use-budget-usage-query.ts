import { computed, reactive } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { BudgetUsageModel } from '@/api-clients/cost-analysis/budget-usage/schema/model';
import { useBudgetUsageApi } from '@/api-clients/cost-analysis/budget/composables/use-budget-usage-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

export const useBudgetUsageQuery = () => {
    const { budgetUsageAPI } = useBudgetUsageApi();

    const budgetUsageListApiQueryHelper = new ApiQueryHelper();

    const _state = reactive({
        budgetUsageListApiQuery: budgetUsageListApiQueryHelper.data,
    });

    const { key: budgetUsageListQueryKey, params: budgetUsageListParams } = useServiceQueryKey('cost-analysis', 'budget-usage', 'list', {
        params: computed(() => ({ query: _state.budgetUsageListApiQuery })),
    });

    const budgetUsageListQuery = useScopedQuery({
        queryKey: budgetUsageListQueryKey,
        queryFn: () => budgetUsageAPI.list(budgetUsageListParams.value),
        select: (data) => data?.results ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: true,
    }, ['DOMAIN', 'WORKSPACE', 'USER']);

    const isLoading = computed<boolean>(() => budgetUsageListQuery.isFetching.value);


    return {
        budgetUsageList: computed<BudgetUsageModel[]>(() => (budgetUsageListQuery.data.value ?? [])),
        isLoading,
        budgetUsageListQueryKey,
        budgetUsageAPI,
    };
};

