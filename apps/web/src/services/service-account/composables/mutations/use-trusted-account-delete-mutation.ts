import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountDeleteParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/detele';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';



interface UseTrustedAccountDeleteMutationOptions {
    onSuccess?: (data: void, variables: TrustedAccountDeleteParameters) => void | Promise<void>;
    onError?: (error: Error, variables: TrustedAccountDeleteParameters) => void | Promise<void>;
    onSettled?: (data: void, error: Error | null, variables: TrustedAccountDeleteParameters) => void | Promise<void>;
}

export const useTrustedAccountDeleteMutation = ({
    onSuccess, onError, onSettled,
}: UseTrustedAccountDeleteMutationOptions = {}) => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix: withSuffixGet } = useServiceQueryKey('identity', 'trusted-account', 'get');
    const { key: listQueryKey } = useServiceQueryKey('identity', 'trusted-account', 'list');

    return useMutation({
        mutationFn: (params: TrustedAccountDeleteParameters) => {
            if (!params.trusted_account_id) { throw new Error('trusted_account_id is required'); }
            return trustedAccountAPI.delete(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffixGet(variables.trusted_account_id) });
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
