import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import type { FolderDeleteParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseDashboardFolderDeleteMutationOptions {
    onSuccess?: (data: unknown, variables: FolderDeleteParams) => void|Promise<void>;
    onError?: (error: Error, variables: FolderDeleteParams) => void|Promise<void>;
    onSettled?: (data: unknown|undefined, error: Error|null, variables: FolderDeleteParams) => void|Promise<void>;
}

export const useDashboardFolderDeleteMutation = (options: UseDashboardFolderDeleteMutationOptions) => {
    const { publicFolderAPI } = usePublicFolderApi();
    const { privateFolderAPI } = usePrivateFolderApi();
    const queryClient = useQueryClient();
    const { withSuffix: publicFolderGetQueryKey } = useServiceQueryKey('dashboard', 'public-folder', 'get');
    const { withSuffix: privateFolderGetQueryKey } = useServiceQueryKey('dashboard', 'private-folder', 'get');

    const {
        onSuccess, onError, onSettled,
    } = options;

    const deleteFolderFn = (params: FolderDeleteParams) => {
        if (!params.folder_id) throw new Error('Folder ID is not provided');
        const _isPrivate = params.folder_id.startsWith('private');
        const fetcher = _isPrivate ? privateFolderAPI.delete : publicFolderAPI.delete;
        return fetcher(params);
    };

    return useMutation({
        mutationFn: deleteFolderFn,
        onSuccess: async (data, variables) => {
            const _folderId = variables.folder_id;
            const _isPrivate = _folderId.startsWith('private');
            const folderListQueryKey = _isPrivate ? privateFolderGetQueryKey(_folderId) : publicFolderGetQueryKey(_folderId);
            queryClient.invalidateQueries({ queryKey: folderListQueryKey });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: (error, variables) => {
            if (onError) onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (onSettled) onSettled(data, error, variables);
        },
    });
};
