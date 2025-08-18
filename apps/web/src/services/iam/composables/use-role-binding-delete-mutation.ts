import { useMutation } from '@tanstack/vue-query';

import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';

import { useRoleBindingQuery } from './use-role-binding-query';

interface UseRoleBindingDeleteMutationOptions {
    onSuccess?: (data: RoleBindingModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: RoleBindingModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useRoleBindingDeleteMutation = (options: UseRoleBindingDeleteMutationOptions) => {
    const { roleBindingAPI, invalidateRoleBindingListQuery } = useRoleBindingQuery();
    const { onSuccess, onError, onSettled } = options;

    return useMutation({
        mutationFn: roleBindingAPI.delete,
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
