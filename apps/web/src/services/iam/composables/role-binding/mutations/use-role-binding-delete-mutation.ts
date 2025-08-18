import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useRoleBindingApi } from '@/api-clients/identity/role-binding/composables/use-role-binding-api';
import type { RoleBindingDeleteParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/delete';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseRoleBindingDeleteMutationOptions {
    onSuccess?: (data: RoleBindingModel, variables: RoleBindingDeleteParameters) => Promise<void> | void;
    onError?: (error: Error, variables: RoleBindingDeleteParameters) => Promise<void> | void;
    onSettled?: (data: RoleBindingModel | undefined, error: Error | null, variables: RoleBindingDeleteParameters) => Promise<void> | void;
}
export const useRoleBindingDeleteMutation = ({
    onSuccess,
    onError,
    onSettled,
}: UseRoleBindingDeleteMutationOptions = {}) => {
    const { roleBindingAPI } = useRoleBindingApi();

    const queryClient = useQueryClient();
    const { key: roleBindingListKey } = useServiceQueryKey('identity', 'role-binding', 'list');


    return useMutation({
        mutationFn: (params: RoleBindingDeleteParameters) => roleBindingAPI.delete(params),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: roleBindingListKey.value });
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
