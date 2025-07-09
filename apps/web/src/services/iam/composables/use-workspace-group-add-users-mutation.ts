import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseWorkspaceGroupAddUsersMutationOptions {
    onSuccess?: (data: WorkspaceGroupModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: WorkspaceGroupModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useWorkspaceGroupAddUsersMutation = (options: UseWorkspaceGroupAddUsersMutationOptions) => {
    const { workspaceGroupAPI } = useWorkspaceGroupApi();
    const queryClient = useQueryClient();

    const { onSuccess, onError, onSettled } = options;

    const { key: workspaceGroupQueryKey } = useServiceQueryKey('identity', 'workspace-group', 'list');

    return useMutation({
        mutationFn: workspaceGroupAPI.addUsers,
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: workspaceGroupQueryKey });
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
