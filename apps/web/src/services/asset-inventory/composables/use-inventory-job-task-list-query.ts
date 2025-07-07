import { computed, type ComputedRef } from 'vue';

import { useInventoryJobTaskApi } from '@/api-clients/inventory/job-task/composables/use-job-task-api';
import type { JobTaskListParameters } from '@/api-clients/inventory/job-task/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UseInventoryJobTaskListQueryOptions {
    params: ComputedRef<JobTaskListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useInventoryJobTaskListQuery = ({
    params,
    thisPage,
    pageSize,
}: UseInventoryJobTaskListQueryOptions) => {
    const { jobTaskAPI } = useInventoryJobTaskApi();
    const { key, params: jobTaskParams } = useServiceQueryKey('inventory', 'job-task', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const {
        data, isLoading, totalCount,
    } = useScopedPaginationQuery({
        queryKey: key,
        queryFn: jobTaskAPI.list,
        params: jobTaskParams,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, {
        thisPage: computed(() => thisPage.value),
        pageSize: computed(() => pageSize.value),
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        jobTaskListData: data,
        isLoading,
        totalCount,
    };
};
