import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useDataSourceAccountApi } from '@/api-clients/cost-analysis/data-source-account/composables/use-data-source-account-api';
import type { CostDataSourceAccountListParameters } from '@/api-clients/cost-analysis/data-source-account/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface UseDataSourceAccountListQueryOptions {
    params?: ComputedRef<CostDataSourceAccountListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}
export const useDataSourceAccountListQuery = ({
    params,
    thisPage,
    pageSize,
}: UseDataSourceAccountListQueryOptions) => {
    const { dataSourceAccountAPI } = useDataSourceAccountApi();
    const { key, params: queryParams } = useServiceQueryKey('cost-analysis', 'data-source-account', 'list', {
        params: computed(() => params?.value || {}),
        pagination: true,
    });

    const {
        data, isLoading, totalCount, query,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: dataSourceAccountAPI.list,
        params: queryParams,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        dataSourceAccountListData: data,
        isLoading,
        totalCount,
        refetch: query.refetch,
    };
};
