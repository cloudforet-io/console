import { toValue } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface TrustedAccountQueryOptions {
    trustedAccountId: ComputedRef<string|undefined>;
    enabled?: ComputedRef<boolean>;
}

export const useTrustedAccountQuery = ({ trustedAccountId, enabled }: TrustedAccountQueryOptions) => {
    const { trustedAccountAPI } = useTrustedAccountApi();

    const { key: trustedAccountQueryKey, params: queryParams } = useServiceQueryKey('identity', 'trusted-account', 'get', {
        params: computed(() => ({
            trusted_account_id: trustedAccountId.value ?? '',
        })),
        contextKey: computed(() => trustedAccountId.value),
    });

    return useScopedQuery({
        queryKey: trustedAccountQueryKey,
        queryFn: () => {
            if (!queryParams.value.trusted_account_id) return Promise.reject(new Error('trustedAccountId is required'));
            return trustedAccountAPI.get(queryParams.value);
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 1,
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return toValue(enabled);
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
