import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useDataSourceApi } from '@/api-clients/cost-analysis/data-source/composables/use-data-source-api';
import type { CostDataSourceListParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface UseDataSourceListQueryOptions {
    params?: ComputedRef<CostDataSourceListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}
export const useDataSourceListQuery = ({
    params,
    thisPage,
    pageSize,
}: UseDataSourceListQueryOptions) => {
    const { dataSourceAPI } = useDataSourceApi();
    const { key, params: queryParams } = useServiceQueryKey('cost-analysis', 'data-source', 'list', {
        params: computed(() => params?.value || {}),
        pagination: true,
    });

    const { data, isLoading, totalCount } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: dataSourceAPI.list,
        params: queryParams,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        dataSourceListData: data,
        isLoading,
        totalCount,
    };
};
