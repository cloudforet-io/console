import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseWorkspaceUserCreateMutationOptions {
    onSuccess?: (data: WorkspaceUserModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: WorkspaceUserModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useWorkspaceUserCreateMutation = (options: UseWorkspaceUserCreateMutationOptions) => {
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const queryClient = useQueryClient();

    const { key: workspaceUserQueryKey } = useServiceQueryKey('identity', 'workspace-user', 'list');

    const { onSuccess, onError, onSettled } = options;

    return useMutation({
        mutationFn: workspaceUserAPI.create,
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: workspaceUserQueryKey.value });
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
