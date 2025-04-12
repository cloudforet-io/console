import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { useDashboardDeleteMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-delete-mutation';
import { useDashboardFolderDeleteMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-folder-delete-mutation';

export const useDashboardBundleDeleteWorkflow = () => {
    const queryClient = useQueryClient();
    const favoriteStore = useFavoriteStore();
    const favoriteGetters = favoriteStore.getters;
    const userWorkspaceStore = useUserWorkspaceStore();

    const currentWorkspaceId = computed(() => userWorkspaceStore.getters.currentWorkspaceId);


    const { key: publicDashboardListQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'list');
    const { key: privateDashboardListQueryKey } = useServiceQueryKey('dashboard', 'private-dashboard', 'list');
    const { key: publicFolderListQueryKey } = useServiceQueryKey('dashboard', 'public-folder', 'list');
    const { key: privateFolderListQueryKey } = useServiceQueryKey('dashboard', 'private-folder', 'list');

    const { mutateAsync: deleteDashboard, isPending: dashboardLoading } = useDashboardDeleteMutation({
        onSuccess: async (_, variables) => {
            const isFavoriteItem = favoriteGetters.dashboardItems.find((item) => item.itemId === variables.dashboard_id);
            if (isFavoriteItem) {
                await favoriteStore.deleteFavorite({
                    itemType: FAVORITE_TYPE.DASHBOARD,
                    workspaceId: currentWorkspaceId.value || '',
                    itemId: variables.dashboard_id,
                });
            }
        },
    });
    const { mutateAsync: deleteFolder, isPending: folderLoading } = useDashboardFolderDeleteMutation({});

    const deleteBundleFolderOrDashboard = async (bundleItems: {
        id: string;
        type: 'DASHBOARD' | 'FOLDER';
    }[]) => {
        const dashboardItems = bundleItems.filter((item) => item.type === 'DASHBOARD');
        const folderItems = bundleItems.filter((item) => item.type === 'FOLDER');
        const isPrivateFolderInclude = folderItems.some((item) => item.id.startsWith('private'));
        const isPublicFolderInclude = folderItems.some((item) => !item.id.startsWith('private'));
        const isPrivateDashboardInclude = dashboardItems.some((item) => item.id.startsWith('private'));
        const isPublicDashboardInclude = dashboardItems.some((item) => !item.id.startsWith('private'));

        const dashboardResults = await Promise.allSettled(
            dashboardItems.map((item) => deleteDashboard({ dashboard_id: item.id })),
        );

        const dashboardFailed = dashboardResults.filter((r) => r.status === 'rejected');
        const isDashboardDeleteAllSuccess = dashboardFailed.length === 0;

        if (isPrivateDashboardInclude) queryClient.invalidateQueries({ queryKey: privateDashboardListQueryKey.value });
        if (isPublicDashboardInclude) queryClient.invalidateQueries({ queryKey: publicDashboardListQueryKey.value });
        if (!isDashboardDeleteAllSuccess) {
            throw new Error('Dashboard delete failed');
        }

        const folderResults = await Promise.allSettled(
            folderItems.map((item) => deleteFolder({ folder_id: item.id })),
        );
        const folderFailed = folderResults.filter((r) => r.status === 'rejected');
        const isFolderDeleteAllSuccess = folderFailed.length === 0;

        if (isPrivateFolderInclude) queryClient.invalidateQueries({ queryKey: privateFolderListQueryKey.value });
        if (isPublicFolderInclude) queryClient.invalidateQueries({ queryKey: publicFolderListQueryKey.value });
        if (!isFolderDeleteAllSuccess) {
            throw new Error('Folder delete failed');
        }

        return true;
    };

    return {
        mutate: deleteBundleFolderOrDashboard,
        isPending: computed(() => dashboardLoading.value || folderLoading.value),
    };
};
