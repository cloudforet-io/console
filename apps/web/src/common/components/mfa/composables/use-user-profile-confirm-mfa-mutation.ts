import { useMutation } from '@tanstack/vue-query';

import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import type { UserProfileConfirmMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/confirm-mfa';
import type { UserModel } from '@/api-clients/identity/user/schema/model';

interface UserUserProfileConfirmMfaMutationOptions {
    onSuccess?: (data: UserModel, variables: UserProfileConfirmMfaParameters) => Promise<void> | void;
    onError?: (error: Error, variables: UserProfileConfirmMfaParameters) => Promise<void> | void;
    onSettled?: (data: UserModel | undefined, error: Error | null, variables: UserProfileConfirmMfaParameters) => Promise<void> | void;
}

export const useUserProfileConfirmMfaMutation = ({
    onSuccess,
    onError,
    onSettled,
}: UserUserProfileConfirmMfaMutationOptions) => {
    const { userProfileAPI } = useUserProfileApi();

    return useMutation({
        mutationFn: (params: UserProfileConfirmMfaParameters) => userProfileAPI.confirmMfa(params),
        onSuccess: async (data, variables) => {
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
