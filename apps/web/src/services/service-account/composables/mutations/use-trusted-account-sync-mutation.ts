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
    const { withSuffix: withSuffixList } = useServiceQueryKey('identity', 'service-account', 'list');

    return useMutation({
        mutationFn: (params: TrustedAccountSyncParameters) => {
            if (!params.trusted_account_id) { throw new Error('trusted_account_id is required'); }
            return trustedAccountAPI.sync(params);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffixGet(variables.trusted_account_id) });
            queryClient.invalidateQueries({ queryKey: withSuffixList(variables.trusted_account_id) });
            if (onSuccess) onSuccess(data, variables);
        },
        onError: (error, variables) => {
            if (onError) onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (onSettled) onSettled(data, error, variables);
        },
    });
};
