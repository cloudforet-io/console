import { computed, type ComputedRef } from 'vue';

import { useInventoryJobApi } from '@/api-clients/inventory/job/composables/use-job-api';
import type { JobListParameters } from '@/api-clients/inventory/job/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseInventoryJobListQueryOptions {
    params: ComputedRef<JobListParameters>;
}

export const useInventoryJobListQuery = ({
    params,
}: UseInventoryJobListQueryOptions) => {
    const { jobAPI } = useInventoryJobApi();
    const { key, params: jobParams } = useServiceQueryKey('inventory', 'job', 'list', {
        params: computed(() => params.value),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: async () => jobAPI.list(jobParams.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
