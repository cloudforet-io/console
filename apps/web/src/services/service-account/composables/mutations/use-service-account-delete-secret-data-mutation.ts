import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountDeleteSecretDataParameters } from '@/api-clients/identity/service-account/schema/api-verbs/detele-secret-data';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';


interface UseServiceAccountDeleteSecretDataMutationOptions {
    onSuccess?: (data: ServiceAccountModel, variables: ServiceAccountDeleteSecretDataParameters) => void|Promise<void>;
    onError?: (error: Error, variables: ServiceAccountDeleteSecretDataParameters) => void|Promise<void>;
    onSettled?: (data: ServiceAccountModel, error: Error|null, variables: ServiceAccountDeleteSecretDataParameters) => void|Promise<void>;
}

export const useServiceAccountDeleteSecretDataMutation = ({ onSuccess, onError, onSettled }: UseServiceAccountDeleteSecretDataMutationOptions) => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix } = useServiceQueryKey('identity', 'service-account', 'get');

    return useMutation({
        mutationFn: (params: ServiceAccountDeleteSecretDataParameters) => {
            if (!params.service_account_id) {
                throw new Error('service_account_id is required');
            }
            return serviceAccountAPI.deleteSecretData(params);
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
