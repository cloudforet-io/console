import { type ComputedRef } from 'vue';

import { useSecretApi } from '@/api-clients/secret/secret/composables/use-secret-api';
import type { SecretListParameters } from '@/api-clients/secret/secret/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


export const useSecretListQuery = (params?: ComputedRef<SecretListParameters>) => {
    const { secretAPI } = useSecretApi();
    const { key, params: secretParams } = useServiceQueryKey('secret', 'secret', 'list', {
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: async () => secretAPI.list(secretParams.value),
        select: (data) => data,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);
};
