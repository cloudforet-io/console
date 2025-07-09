import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountUpdateSecretDataParameters } from '@/api-clients/identity/service-account/schema/api-verbs/update-secret-data';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';


interface UseServiceAccountUpdateSecretDataMutationOptions {
    onSuccess?: (data: ServiceAccountModel, variables: ServiceAccountUpdateSecretDataParameters) => void|Promise<void>;
    onError?: (error: Error, variables: ServiceAccountUpdateSecretDataParameters) => void|Promise<void>;
    onSettled?: (data: ServiceAccountModel|undefined, error: Error|null, variables: ServiceAccountUpdateSecretDataParameters) => void|Promise<void>;
}

export const useServiceAccountUpdateSecretDataMutation = ({ onSuccess, onError, onSettled }: UseServiceAccountUpdateSecretDataMutationOptions) => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'service-account', 'get');

    return useMutation({
        mutationFn: (params: ServiceAccountUpdateSecretDataParameters) => {
            if (!params.service_account_id) {
                throw new Error('service_account_id is required');
            }
            return serviceAccountAPI.updateSecretData(params);
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffix([variables.service_account_id]) });
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
