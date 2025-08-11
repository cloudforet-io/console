import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountDeleteParameters } from '@/api-clients/identity/service-account/schema/api-verbs/detele';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountDeleteMutationOptions {
    onSuccess?: (data: void, variables: ServiceAccountDeleteParameters) => void | Promise<void>;
    onError?: (error: Error, variables: ServiceAccountDeleteParameters) => void | Promise<void>;
    onSettled?: (data: void, error: Error | null, variables: ServiceAccountDeleteParameters) => void | Promise<void>;
}

export const useServiceAccountDeleteMutation = ({
    onSuccess, onError, onSettled,
}: UseServiceAccountDeleteMutationOptions = {}) => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix: withSuffixGet } = useServiceQueryKey('identity', 'service-account', 'get');
    const { key: listQueryKey } = useServiceQueryKey('identity', 'service-account', 'list');

    return useMutation({
        mutationFn: (params: ServiceAccountDeleteParameters) => {
            if (!params.service_account_id) { throw new Error('service_account_id is required'); }
            return serviceAccountAPI.delete(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffixGet(variables.service_account_id) });
            queryClient.invalidateQueries({ queryKey: listQueryKey.value });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });
};
