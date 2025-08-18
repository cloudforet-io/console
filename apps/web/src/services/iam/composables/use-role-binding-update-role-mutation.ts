import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useRoleBindingApi } from '@/api-clients/identity/role-binding/composables/use-role-binding-api';
import type { RoleBindingUpdateRoleParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/update-role';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseRoleBindingUpdateRoleMutationOptions {
    onSuccess?: (data: RoleBindingModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
}

export const useRoleBindingUpdateRoleMutation = (options: UseRoleBindingUpdateRoleMutationOptions) => {
    const { roleBindingAPI } = useRoleBindingApi();
    const queryClient = useQueryClient();

    const { key: roleBindingListQueryKey } = useServiceQueryKey('identity', 'role-binding', 'list');

    const {
        onSuccess, onError,
    } = options;

    return useMutation({
        mutationFn: (params: RoleBindingUpdateRoleParameters) => roleBindingAPI.updateRole(params),
        onSuccess: async (data) => {
            queryClient.setQueryData(roleBindingListQueryKey.value, data);
            if (onSuccess) await onSuccess(data);
        },
        onError: async (error) => {
            if (onError) await onError(error);
        },
    });
};
