import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountListParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


interface UseTrustedAccountListQueryOptions {
    params: ComputedRef<TrustedAccountListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useTrustedAccountListQuery = ({ params, enabled }: UseTrustedAccountListQueryOptions) => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const { key, params: trustedAccountListParams } = useServiceQueryKey('identity', 'trusted-account', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => trustedAccountAPI.list(trustedAccountListParams.value),
        select: (data) => data?.results ?? [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minutes
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
