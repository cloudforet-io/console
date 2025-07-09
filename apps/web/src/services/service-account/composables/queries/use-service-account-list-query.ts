import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface UseServiceAccountListQueryOptions {
    params: ComputedRef<ServiceAccountListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountListQuery = ({ params, enabled }: UseServiceAccountListQueryOptions) => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const { key, params: serviceAccountListParams } = useServiceQueryKey('identity', 'service-account', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => serviceAccountAPI.list(serviceAccountListParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
