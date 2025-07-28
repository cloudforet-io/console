import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserDisableMfaParameters } from '@/api-clients/identity/user/schema/api-verbs/disable-mfa';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseUserMfaDisableMutationOptions {
    onSuccess?: (data: UserModel, variables: UserDisableMfaParameters) => Promise<void> | void;
    onError?: (error: Error, variables: UserDisableMfaParameters) => Promise<void> | void;
    onSettled?: (data: UserModel | undefined, error: Error | null, variables: UserDisableMfaParameters) => Promise<void> | void;
    mutationOptions?: {
        manualInvalidate?: boolean;
    };
}

export const useUserMfaDisableMutation = ({
    onSuccess,
    onError,
    onSettled,
    mutationOptions = { manualInvalidate: false },
}: UseUserMfaDisableMutationOptions = {}) => {
    const { userAPI } = useUserApi();

    const queryClient = useQueryClient();
    const { withSuffix: userGetSuffix } = useServiceQueryKey('identity', 'user', 'get');
    const { key: userListKey } = useServiceQueryKey('identity', 'user', 'list');
    const { withSuffix: userProfileGetSuffix } = useServiceQueryKey('identity', 'user-profile', 'get');
    const { key: userProfileListKey } = useServiceQueryKey('identity', 'user-profile', 'list');
    const { withSuffix: workspaceUserGetSuffix } = useServiceQueryKey('identity', 'workspace-user', 'get');
    const { key: workspaceUserListKey } = useServiceQueryKey('identity', 'workspace-user', 'list');


    return useMutation({
        mutationFn: (params: UserDisableMfaParameters) => {
            if (!params.user_id) {
                if (import.meta.env.DEV) throw new Error('[useUserMfaDisableMutation.ts] User ID is required');
                else throw new Error('[User MFA Disable] Something went wrong! Try again later. If the problem persists, please contact support.');
            }
            return userAPI.disableMfa(params);
        },
        onSuccess: async (data, variables) => {
            if (!mutationOptions?.manualInvalidate) {
                await queryClient.invalidateQueries({ queryKey: userGetSuffix(variables.user_id) });
                await queryClient.invalidateQueries({ queryKey: userListKey.value });
                await queryClient.invalidateQueries({ queryKey: userProfileGetSuffix(variables.user_id) });
                await queryClient.invalidateQueries({ queryKey: userProfileListKey.value });
                await queryClient.invalidateQueries({ queryKey: workspaceUserGetSuffix(variables.user_id) });
                await queryClient.invalidateQueries({ queryKey: workspaceUserListKey.value });
            }
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
