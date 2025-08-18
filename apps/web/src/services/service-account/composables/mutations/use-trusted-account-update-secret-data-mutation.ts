import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountUpdateSecretDataParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update-secret-data';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseTrustedAccountUpdateSecretDataMutationOptions {
    onSuccess?: (data: TrustedAccountModel, variables: TrustedAccountUpdateSecretDataParameters) => void|Promise<void>;
    onError?: (error: Error, variables: TrustedAccountUpdateSecretDataParameters) => void|Promise<void>;
    onSettled?: (data: TrustedAccountModel|undefined, error: Error|null, variables: TrustedAccountUpdateSecretDataParameters) => void|Promise<void>;
}

export const useTrustedAccountUpdateSecretDataMutation = ({ onSuccess, onError, onSettled }: UseTrustedAccountUpdateSecretDataMutationOptions) => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'trusted-account', 'get');

    return useMutation({
        mutationFn: (params: TrustedAccountUpdateSecretDataParameters) => {
            if (!params.trusted_account_id) {
                throw new Error('trusted_account_id is required');
            }
            return trustedAccountAPI.updateSecretData(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffix([variables.trusted_account_id]) });
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
