import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useJobApi } from '@/api-clients/identity/job/composables/use-job-api';
import type { IdentityJobListParameters } from '@/api-clients/identity/job/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseServiceAccountJobListQueryOptions {
    params: ComputedRef<IdentityJobListParameters>;
    refetchInterval?: (query) => number|false|undefined;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountJobListQuery = ({ params, refetchInterval, enabled }: UseServiceAccountJobListQueryOptions) => {
    const {
        jobAPI,
    } = useJobApi();
    const { key, params: queryParams } = useServiceQueryKey('identity', 'job', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => jobAPI.list(queryParams.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 1,
        select: (data) => data.results ?? [],
        refetchInterval: refetchInterval ? (query) => refetchInterval(query) : false,
        enabled: computed(() => {
            if (!enabled) return true;
            return enabled.value;
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
