import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountUpdateParameters } from '@/api-clients/identity/service-account/schema/api-verbs/update';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseServiceAccountUpdateMutationOptions {
    onSuccess?: (data: ServiceAccountModel, variables: ServiceAccountUpdateParameters) => void | Promise<void>;
    onError?: (error: Error, variables: ServiceAccountUpdateParameters) => void | Promise<void>;
    onSettled?: (data: ServiceAccountModel, error: Error | null, variables: ServiceAccountUpdateParameters) => void | Promise<void>;
}

export const useServiceAccountUpdateMutation = ({
    onSuccess, onError, onSettled,
}: UseServiceAccountUpdateMutationOptions = {}) => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const queryClient = useQueryClient();
    const { withSuffix: withSuffixGet } = useServiceQueryKey('identity', 'service-account', 'get');
    const { withSuffix: withSuffixList } = useServiceQueryKey('identity', 'service-account', 'list');

    return useMutation({
        mutationFn: (params: ServiceAccountUpdateParameters) => {
            if (!params.service_account_id) { throw new Error('service_account_id is required'); }
            return serviceAccountAPI.update(params);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: withSuffixGet(variables.service_account_id) });
            queryClient.invalidateQueries({ queryKey: withSuffixList(variables.service_account_id) });
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
