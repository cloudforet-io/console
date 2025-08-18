import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountSyncParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/sync';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseTrustedAccountSyncMutationOptions {
    onSuccess?: (data: void, variables: TrustedAccountSyncParameters) => void|Promise<void>;
    onError?: (error: Error, variables: TrustedAccountSyncParameters) => void|Promise<void>;
    onSettled?: (data: void, error: Error|null, variables: TrustedAccountSyncParameters) => void|Promise<void>;
}

export const useTrustedAccountSyncMutation = ({
    onSuccess, onError, onSettled,
}: UseTrustedAccountSyncMutationOptions = {}) => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix: withSuffixGet } = useServiceQueryKey('identity', 'service-account', 'get');
    const { key: listQueryKey } = useServiceQueryKey('identity', 'service-account', 'list');

    return useMutation({
        mutationFn: (params: TrustedAccountSyncParameters) => {
            if (!params.trusted_account_id) { throw new Error('trusted_account_id is required'); }
            return trustedAccountAPI.sync(params);
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
