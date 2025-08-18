import { toValue } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface ServiceAccountQueryOptions {
    serviceAccountId: ComputedRef<string|undefined>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountQuery = ({ serviceAccountId, enabled }: ServiceAccountQueryOptions) => {
    const { serviceAccountAPI } = useServiceAccountApi();

    const { key: serviceAccountQueryKey, params: queryParams } = useServiceQueryKey('identity', 'service-account', 'get', {
        params: computed(() => ({
            service_account_id: serviceAccountId.value ?? '',
        })),
        contextKey: computed(() => serviceAccountId.value),
    });

    return useScopedQuery({
        queryKey: serviceAccountQueryKey,
        queryFn: () => {
            if (!queryParams.value.service_account_id) {
                return Promise.reject(new Error('serviceAccountId is required'));
            }
            return serviceAccountAPI.get(queryParams.value);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return toValue(enabled);
        }),
    }, ['DOMAIN', 'WORKSPACE']);
};
