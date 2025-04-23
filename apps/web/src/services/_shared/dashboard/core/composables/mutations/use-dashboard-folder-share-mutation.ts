import type { ComputedRef } from 'vue';

import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderShareParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/share';
import type { PublicFolderUnshareParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/unshare';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseDashboardFolderShareMutationOptions {
    isShared: ComputedRef<boolean>;
    onSuccess?: (data: PublicFolderModel, variables: PublicFolderShareParameters|PublicFolderUnshareParameters) => void|Promise<void>;
    onError?: (error: Error, variables: PublicFolderShareParameters|PublicFolderUnshareParameters) => void|Promise<void>;
    onSettled?: (data: PublicFolderModel|undefined, error: Error|null, variables: PublicFolderShareParameters|PublicFolderUnshareParameters) => void|Promise<void>;
}

export const useDashboardFolderShareMutation = (options: UseDashboardFolderShareMutationOptions) => {
    const { publicFolderAPI } = usePublicFolderApi();
    const { publicDashboardAPI } = usePublicDashboardApi();
    const queryClient = useQueryClient();
    const { withSuffix: publicFolderGetQueryKeyWithSuffix } = useServiceQueryKey('dashboard', 'public-folder', 'get');
    const { withSuffix: publicDashboardGetQueryKeyWithSuffix } = useServiceQueryKey('dashboard', 'public-dashboard', 'get');
    const { key: publicFolderListQueryKey } = useServiceQueryKey('dashboard', 'public-folder', 'list');
    const { key: publicDashboardListQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'list');
    const {
        isShared, onSuccess, onError, onSettled,
    } = options;


    const listPublicDashboard = async (folderId: string) => {
        if (!folderId) throw new Error('Folder ID is not provided');
        try {
            const _dashboardList = await publicDashboardAPI.list({
                folder_id: folderId,
            });
            return _dashboardList;
        } catch (error) {
            console.error(error);
            return {
                results: [],
            };
        }
    };

    const shareFolderFn = async (params: PublicFolderShareParameters|PublicFolderUnshareParameters): Promise<PublicFolderModel> => {
        if (!params.folder_id) throw new Error('Folder ID is not provided');
        if (isShared.value) return publicFolderAPI.unshare(params as PublicFolderUnshareParameters);
        return publicFolderAPI.share(params as PublicFolderShareParameters);
    };

    return useMutation({
        mutationFn: shareFolderFn,
        onSuccess: async (data, variables) => {
            const _folderId = variables.folder_id;
            queryClient.invalidateQueries({ queryKey: publicFolderGetQueryKeyWithSuffix(_folderId) });
            if (!isShared.value) {
                const _dashboardList = await listPublicDashboard(_folderId);
                const _dashboardIds = _dashboardList.results?.map((dashboard) => dashboard.dashboard_id);
                if (_dashboardIds) {
                    await Promise.all(
                        _dashboardIds.map((dashboardId) => queryClient.invalidateQueries({ queryKey: publicDashboardGetQueryKeyWithSuffix(dashboardId) })),
                    );
                }
            }
            queryClient.invalidateQueries({ queryKey: publicFolderListQueryKey });
            queryClient.invalidateQueries({ queryKey: publicDashboardListQueryKey });
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
