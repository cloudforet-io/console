import { useMutation } from '@tanstack/vue-query';

import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';

import { useRoleBindingQuery } from '@/services/iam/composables/use-role-binding-query';

interface UseRoleBindingCreateMutationOptions {
    onSuccess?: (data: RoleBindingModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: RoleBindingModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useRoleBindingCreateMutation = (options: UseRoleBindingCreateMutationOptions) => {
    const { roleBindingAPI, invalidateRoleBindingListQuery } = useRoleBindingQuery();
    const { onSuccess, onError, onSettled } = options;

    return useMutation({
        mutationFn: roleBindingAPI.create,
        onSuccess: async (data) => {
            invalidateRoleBindingListQuery();
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
