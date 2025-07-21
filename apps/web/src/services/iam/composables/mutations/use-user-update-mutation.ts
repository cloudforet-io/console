import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseUserUpdateMutationOptions {
    onSuccess?: (data: UserModel, variables: UserUpdateParameters) => Promise<void> | void;
    onError?: (error: Error, variables: UserUpdateParameters) => Promise<void> | void;
    onSettled?: (data: UserModel | undefined, error: Error | null, variables: UserUpdateParameters) => Promise<void> | void;
}

export const useUserUpdateMutation = ({
    onSuccess,
    onError,
    onSettled,
}: UseUserUpdateMutationOptions = {}) => {
    const { userAPI } = useUserApi();

    const queryClient = useQueryClient();
    const { withSuffix: userGetSuffix } = useServiceQueryKey('identity', 'user', 'get');
    const { key: userListKey } = useServiceQueryKey('identity', 'user', 'list');
    const { withSuffix: workspaceUserGetSuffix } = useServiceQueryKey('identity', 'workspace-user', 'get');
    const { key: workspaceUserListKey } = useServiceQueryKey('identity', 'workspace-user', 'list');


    return useMutation({
        mutationFn: (params: UserUpdateParameters) => {
            if (!params.user_id) {
                if (import.meta.env.DEV) throw new Error('[useUserUpdateMutation.ts] User ID is required');
                else throw new Error('[User Update] Something went wrong! Try again later. If the problem persists, please contact support.');
            }
            return userAPI.update(params);
        },
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: userGetSuffix(variables.user_id) });
            await queryClient.invalidateQueries({ queryKey: userListKey.value });
            await queryClient.invalidateQueries({ queryKey: workspaceUserGetSuffix(variables.user_id) });
            await queryClient.invalidateQueries({ queryKey: workspaceUserListKey.value });
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
