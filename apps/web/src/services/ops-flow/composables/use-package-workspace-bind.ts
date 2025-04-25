import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';


const useWorkspaceMutations = () => {
    const { workspaceAPI } = useWorkspaceApi();
    const { key: workspaceListQueryKey } = useServiceQueryKey('identity', 'workspace', 'list');
    const { withSuffix: workspaceWithSuffix } = useServiceQueryKey('identity', 'workspace', 'get');
    const queryClient = useQueryClient();
    const { mutateAsync: addPackageToWorkspace } = useMutation({
        mutationFn: workspaceAPI.addPackage,
        onSuccess: (updatedWorkspace) => {
            queryClient.setQueryData(workspaceWithSuffix(updatedWorkspace.workspace_id), updatedWorkspace);
        },
        onError: (error) => {
            ErrorHandler.handleError(error);
        },
    });

    const { mutateAsync: removePackageFromWorkspace } = useMutation({
        mutationFn: workspaceAPI.removePackage,
        onSuccess: (updatedWorkspace) => {
            queryClient.setQueryData(workspaceWithSuffix(updatedWorkspace.workspace_id), updatedWorkspace);
        },
        onError: (error) => {
            ErrorHandler.handleError(error);
        },
    });
    return {
        addPackageToWorkspace, removePackageFromWorkspace, workspaceListQueryKey,
    };
};

export const usePackageWorkspaceBind = () => {
    const queryClient = useQueryClient();
    const { addPackageToWorkspace, removePackageFromWorkspace, workspaceListQueryKey } = useWorkspaceMutations();

    const addPackageToWorkspaces = async (packageId: string, workspaceIds: string[]) => {
        const responses = await Promise.allSettled([
            ...workspaceIds.map((workspaceId) => addPackageToWorkspace({
                package_id: packageId,
                workspace_id: workspaceId,
            })),
        ]);

        // Invalidate workspace list query
        queryClient.invalidateQueries({ queryKey: workspaceListQueryKey.value });

        // set error messages
        const errorMessages: string[] = [];
        responses.forEach((response, index) => {
            if (response.status === 'rejected') {
                errorMessages.push(`- Workspace ID: ${workspaceIds[index]}, Reason: ${response.reason.message}`);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to add package to workspaces:\n${errorMessages.join('\n')}`);
        }
    };

    const removePackageFromWorkspaces = async (packageId: string, workspaceIds: string[]) => {
        const responses = await Promise.allSettled([
            ...workspaceIds.map((workspaceId) => removePackageFromWorkspace({
                package_id: packageId,
                workspace_id: workspaceId,
            })),
        ]);

        // Invalidate workspace list query
        queryClient.invalidateQueries({ queryKey: workspaceListQueryKey.value });

        // set error messages
        const errorMessages: string[] = [];
        responses.forEach((response, index) => {
            if (response.status === 'rejected') {
                errorMessages.push(`- Workspace ID: ${workspaceIds[index]}, Reason: ${response.reason.message}`);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to remove package from workspaces:\n${errorMessages.join('\n')}`);
        }
    };

    const applyPackageToWorkspaces = async (packageId: string, addedWorkspaceIds: string[], removedWorkspaceIds: string[]) => {
        const responses = await Promise.allSettled([
            addPackageToWorkspaces(packageId, addedWorkspaceIds),
            removePackageFromWorkspaces(packageId, removedWorkspaceIds),
        ]);
        const errorMessages: string[] = [];
        responses.forEach((response) => {
            if (response.status === 'rejected') {
                errorMessages.push(response.reason.message);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to apply package to workspaces:\n${errorMessages.join('\n')}`);
        }
    };
    return { applyPackageToWorkspaces };
};
