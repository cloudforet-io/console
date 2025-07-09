import type { ComputedRef } from 'vue';
import { computed } from 'vue';


import { useSecretApi } from '@/api-clients/secret/secret/composables/use-secret-api';
import type { SecretGetParameters } from '@/api-clients/secret/secret/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseServiceAccountSecretQueryOptions {
    params: ComputedRef<SecretGetParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useServiceAccountSecretQuery = ({ params, enabled }: UseServiceAccountSecretQueryOptions) => {
    const { secretAPI } = useSecretApi();
    const { key, params: secretGetParams } = useServiceQueryKey('secret', 'secret', 'get', {
        params,
        contextKey: computed(() => params.value.secret_id),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => secretAPI.get(secretGetParams.value),
        enabled: computed(() => {
            if (enabled === undefined) return true;
            return enabled.value;
        }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
    }, ['DOMAIN', 'WORKSPACE']);
};
