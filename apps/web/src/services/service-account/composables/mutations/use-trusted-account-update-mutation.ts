import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountUpdateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseTrustedAccountUpdateMutationOptions {
    onSuccess?: (data: TrustedAccountModel, variables: TrustedAccountUpdateParameters) => void | Promise<void>;
    onError?: (error: Error, variables: TrustedAccountUpdateParameters) => void | Promise<void>;
    onSettled?: (data: TrustedAccountModel | undefined, error: Error | null, variables: TrustedAccountUpdateParameters) => void | Promise<void>;
}

export const useTrustedAccountUpdateMutation = ({
    onSuccess, onError, onSettled,
}: UseTrustedAccountUpdateMutationOptions = {}) => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix: withSuffixGet } = useServiceQueryKey('identity', 'trusted-account', 'get');
    const { key: listQueryKey } = useServiceQueryKey('identity', 'trusted-account', 'list');

    return useMutation({
        mutationFn: (params: TrustedAccountUpdateParameters) => {
            if (!params.trusted_account_id) { throw new Error('trusted_account_id is required'); }
            return trustedAccountAPI.update(params);
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
