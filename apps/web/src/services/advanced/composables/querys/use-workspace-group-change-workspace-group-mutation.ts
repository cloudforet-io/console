import { useMutation } from '@tanstack/vue-query';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceChangeWorkspaceGroupParameters } from '@/api-clients/identity/workspace/schema/api-verbs/change-workspace-group';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseWorkspaceGroupChangeWorkspaceGroupMutationOptions {
    onSuccess?: (data: WorkspaceModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: WorkspaceModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useWorkspaceGroupChangeWorkspaceGroupMutation = (options?: UseWorkspaceGroupChangeWorkspaceGroupMutationOptions) => {
    const { workspaceAPI } = useWorkspaceApi();

    const { onSuccess, onError, onSettled } = options || {};

    const { mutateAsync: changeWorkspaceGroupMutation } = useMutation({
        mutationFn: (params: WorkspaceChangeWorkspaceGroupParameters) => workspaceAPI.changeWorkspaceGroup(params),
        onError: async (e) => {
            ErrorHandler.handleError(e, true);
            if (onError) await onError(e);
        },
        onSuccess: async (data) => {
            if (onSuccess) await onSuccess(data);
        },
        onSettled: async (data, error) => {
            if (onSettled) await onSettled(data, error);
        },
    });

    return {
        changeWorkspaceGroupMutation,
    };
};


