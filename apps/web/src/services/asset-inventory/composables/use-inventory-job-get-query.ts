import { computed, type ComputedRef } from 'vue';

import { useInventoryJobApi } from '@/api-clients/inventory/job/composables/use-job-api';
import type { JobGetParameters } from '@/api-clients/inventory/job/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useInventoryJobGetQuery = (jobId: ComputedRef<string|undefined>) => {
    const { jobAPI } = useInventoryJobApi();
    const { key, params: jobParams } = useServiceQueryKey('inventory', 'job', 'get', {
        contextKey: jobId,
        params: computed<JobGetParameters>(() => ({
            job_id: jobId?.value as string,
        })),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => jobAPI.get(jobParams.value),
        enabled: computed(() => !!jobId?.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
