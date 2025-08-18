import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import type { AppDeleteParameters } from '@/api-clients/identity/app/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseAppDeleteMutationOptions {
    onSuccess?: (data: unknown, variables: AppDeleteParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AppDeleteParameters) => void|Promise<void>;
    onSettled?: (data: unknown|undefined, error: Error|null, variables: AppDeleteParameters) => void|Promise<void>;
}

export const useAppDeleteMutation = (options?: UseAppDeleteMutationOptions) => {
    const { appAPI } = useAppApi();
    const queryClient = useQueryClient();

    const { key: appListBaseQueryKey } = useServiceQueryKey('identity', 'app', 'list');

    return useMutation({
        mutationFn: (params: AppDeleteParameters) => appAPI.delete(params),
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: appListBaseQueryKey.value });
            if (options?.onSuccess) await options.onSuccess(data, variables);
        },
        onError: (error, variables) => {
            ErrorHandler.handleError(error, true);
            if (options?.onError) options.onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (options?.onSettled) options.onSettled(data, error, variables);
        },
    });
};
