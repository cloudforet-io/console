import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import type { DashboardDeleteParams, DashboardListParams } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderDeleteParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseDashboardFolderDeleteActionOptions {
    folderId: ComputedRef<string|undefined>;
    onSuccess?: (data: unknown, variables: FolderDeleteParams) => void|Promise<void>;
    onError?: (error: Error, variables: FolderDeleteParams) => void|Promise<void>;
    onSettled?: (data: unknown|undefined, error: Error|null, variables: FolderDeleteParams) => void|Promise<void>;
}

export const useDashboardFolderDeleteAction = (options: UseDashboardFolderDeleteActionOptions) => {
    const { publicFolderAPI } = usePublicFolderApi();
    const { privateFolderAPI } = usePrivateFolderApi();
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const queryClient = useQueryClient();
    const { withSuffix: publicFolderGetQueryKey } = useServiceQueryKey('dashboard', 'public-folder', 'get');
    const { withSuffix: privateFolderGetQueryKey } = useServiceQueryKey('dashboard', 'private-folder', 'get');
    const { withSuffix: publicDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'get');
    const { withSuffix: privateDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'private-dashboard', 'get');

    const {
        folderId, onSuccess, onError, onSettled,
    } = options;

    const isPrivate = computed(() => folderId.value?.startsWith('private'));

    const listDashboardFn = (params: DashboardListParams) => {
        if (!folderId.value) throw new Error('Folder ID is not provided');
        const fetcher = isPrivate.value ? privateDashboardAPI.list : publicDashboardAPI.list;
        return fetcher(params);
    };
    const deleteDashboardFn = (params: DashboardDeleteParams) => {
        if (!params.dashboard_id) throw new Error('Dashboard ID is not provided');
        const fetcher = isPrivate.value ? privateDashboardAPI.delete : publicDashboardAPI.delete;
        return fetcher(params);
    };

    const deleteDashboardListByFolderId = async (_folderId: string) => {
        const _dashboardList = await listDashboardFn({
            folder_id: _folderId,
        });
        const _dashboardIds = _dashboardList.results?.map((d) => d.dashboard_id);
        if (!_dashboardIds) return;
        const _dashboardDeletePromises = _dashboardIds.map(async (id) => {
            const _isPrivate = id.startsWith('private');
            await deleteDashboardFn({ dashboard_id: id });
            queryClient.invalidateQueries({ queryKey: _isPrivate ? privateDashboardGetQueryKey(id) : publicDashboardGetQueryKey(id) });
        });
        await Promise.all(_dashboardDeletePromises);
    };

    const deleteFolderFn = (params: FolderDeleteParams) => {
        if (!folderId.value) throw new Error('Folder ID is not provided');
        const fetcher = isPrivate.value ? privateFolderAPI.delete : publicFolderAPI.delete;
        return fetcher(params);
    };

    return useMutation({
        mutationFn: deleteFolderFn,
        onSuccess: async (data, variables) => {
            const _folderId = variables.folder_id;
            const _isPrivate = _folderId.startsWith('private');
            const folderListQueryKey = _isPrivate ? privateFolderGetQueryKey(_folderId) : publicFolderGetQueryKey(_folderId);
            queryClient.invalidateQueries({ queryKey: folderListQueryKey });

            await deleteDashboardListByFolderId(_folderId);

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
