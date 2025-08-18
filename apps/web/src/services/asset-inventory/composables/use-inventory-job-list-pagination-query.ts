import { computed, type ComputedRef } from 'vue';

import { useInventoryJobApi } from '@/api-clients/inventory/job/composables/use-job-api';
import type { JobListParameters } from '@/api-clients/inventory/job/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';


interface UseInventoryJobListPaginationQueryOptions {
    params: ComputedRef<JobListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useInventoryJobListPaginationQuery = ({ params, thisPage, pageSize }: UseInventoryJobListPaginationQueryOptions) => {
    const { jobAPI } = useInventoryJobApi();
    const { key, params: queryParams } = useServiceQueryKey('inventory', 'job', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, totalCount, isLoading, query,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: jobAPI.list,
        params: queryParams,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data,
        totalCount,
        isLoading: isLoading || query.isFetching,
        isSuccess: computed(() => query.isSuccess.value),
        refetch: query.refetch,
    };
};
