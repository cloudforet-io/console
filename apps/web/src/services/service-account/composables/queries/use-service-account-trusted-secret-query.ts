import type { ComputedRef } from 'vue';
import { computed } from 'vue';


import { useTrustedSecretApi } from '@/api-clients/secret/trusted-secret/composables/use-trusted-secret-api';
import type { TrustedSecretGetParameters } from '@/api-clients/secret/trusted-secret/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseServiceAccountTrustedSecretQueryOptions {
    params: ComputedRef<TrustedSecretGetParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountTrustedSecretQuery = ({ params, enabled }: UseServiceAccountTrustedSecretQueryOptions) => {
    const { trustedSecretAPI } = useTrustedSecretApi();
    const { key, params: trustedSecretGetParams } = useServiceQueryKey('secret', 'trusted-secret', 'get', {
        params,
        contextKey: computed(() => params.value.trusted_secret_id),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => trustedSecretAPI.get(trustedSecretGetParams.value),
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
    }, ['DOMAIN', 'WORKSPACE']);
};
