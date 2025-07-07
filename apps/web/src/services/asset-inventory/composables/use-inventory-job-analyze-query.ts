import { computed, type ComputedRef } from 'vue';

import { useInventoryJobApi } from '@/api-clients/inventory/job/composables/use-job-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useInventoryJobAnalyzeQuery = ({ collectorIds }: { collectorIds: ComputedRef<string[]> }) => {
    const { jobAPI } = useInventoryJobApi();
    const params = computed(() => ({
        query: {
            filter: [
                {
                    k: 'created_at',
                    v: 'now - 5d',
                    o: 'timediff_gte',
                },
                {
                    k: 'collector_id',
                    v: collectorIds.value,
                    o: 'in',
                },
            ],
            group_by: ['collector_id'],
            fields: {
                job_status: {
                    operator: 'push',
                    fields: {
                        status: 'status',
                        job_id: 'job_id',
                        total_tasks: 'total_tasks',
                        remained_tasks: 'remained_tasks',
                        finished_at: 'finished_at',
                    },
                },
            },
        },
    }));
    const { key, params: jobParams } = useServiceQueryKey('inventory', 'job', 'analyze', {
        params,
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => jobAPI.analyze(jobParams.value),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN', 'WORKSPACE']);
};
