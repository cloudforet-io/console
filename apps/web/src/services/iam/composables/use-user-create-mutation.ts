import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseUserCreateMutationOptions {
    onSuccess?: (data: UserModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: UserModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useUserCreateMutation = (options: UseUserCreateMutationOptions) => {
    const { userAPI } = useUserApi();
    const queryClient = useQueryClient();

    const { key: userQueryKey } = useServiceQueryKey('identity', 'user', 'list');

    const { onSuccess, onError, onSettled } = options;

    return useMutation({
        mutationFn: userAPI.create,
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: userQueryKey });
            if (onSuccess) await onSuccess(data);
        },
        onError: async (error) => {
            if (onError) await onError(error);
        },
        onSettled: async (data, error) => {
            if (onSettled) await onSettled(data, error);
        },
    });
};
