import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useCostJobApi } from '@/api-clients/cost-analysis/job/composables/use-job-api';
import type { CostJobGetParameters } from '@/api-clients/cost-analysis/job/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useCostJobGetQuery = (costJobId: ComputedRef<string | undefined>) => {
    const { costJobAPI } = useCostJobApi();

    const { key, params } = useServiceQueryKey('cost-analysis', 'job', 'get', {
        contextKey: costJobId,
        params: computed<CostJobGetParameters>(() => ({
            job_id: costJobId.value as string,
        })),
    });

    const { data, isLoading, error } = useScopedQuery({
        queryKey: key,
        queryFn: () => costJobAPI.get(params.value),
        enabled: computed(() => !!costJobId.value),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        costJob: data,
        isLoading,
        error,
    };
};
