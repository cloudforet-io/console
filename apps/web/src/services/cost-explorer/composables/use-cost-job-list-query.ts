import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCostJobApi } from '@/api-clients/cost-analysis/job/composables/use-job-api';
import type { CostJobListParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface UseCostJobListQueryOptions {
    params?: ComputedRef<CostJobListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}
export const useCostJobListQuery = ({
    params,
    thisPage,
    pageSize,
}: UseCostJobListQueryOptions) => {
    const { costJobAPI } = useCostJobApi();
    const { key, params: queryParams } = useServiceQueryKey('cost-analysis', 'job', 'list', {
        params: computed(() => params?.value || {}),
        pagination: true,
    });

    const { data, isLoading, totalCount } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: costJobAPI.list,
        params: queryParams,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costJobListData: data,
        isLoading,
        totalCount,
    };
};
