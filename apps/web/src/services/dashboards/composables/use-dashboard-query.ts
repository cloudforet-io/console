import {
    computed, reactive, watch,
} from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useUserStore } from '@/store/user/user-store';

// import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';


export const useDashboardQuery = () => {
    const { publicDashboardAPI, publicDashboardListQueryKey } = usePublicDashboardApi();
    const { privateDashboardAPI, privateDashboardListQueryKey } = usePrivateDashboardApi();
    const { publicFolderAPI, publicFolderListQueryKey } = usePublicFolderApi();
    const { privateFolderAPI, privateFolderListQueryKey } = usePrivateFolderApi();
    const queryClient = useQueryClient();

    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    // const favoriteStore = useFavoriteStore();
    // const favoriteGetters = favoriteStore.getters;
    const allReferenceStore = useAllReferenceStore();
    const userStore = useUserStore();
    const publicDashboardListApiQueryHelper = new ApiQueryHelper();
    const publicFolderListApiQueryHelper = new ApiQueryHelper();

    const _state = reactive({
        // Store State
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        currentWorkspace: computed(() => userWorkspaceStore.getters.currentWorkspace),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
        costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
        userId: computed<string|undefined>(() => userStore.state.userId),
        // state
        publicDashboardListApiQuery: publicDashboardListApiQueryHelper.data,
        publicFolderListApiQuery: publicFolderListApiQueryHelper.data,
    });

    /* Keys */
    const _publicDashboardListQueryKey = computed(() => [
        ...publicDashboardListQueryKey.value,
        {
            query: {
                ..._state.publicDashboardListApiQuery,
                sort: [{ key: 'created_at', desc: true }],
            },
        },
    ]);
    const _privateDashboardListQueryKey = computed(() => [
        ...privateDashboardListQueryKey.value,
        {
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        },
    ]);
    const _publicFolderListQueryKey = computed(() => [
        ...publicFolderListQueryKey.value,
        {
            query: {
                ..._state.publicFolderListApiQuery,
                sort: [{ key: 'created_at', desc: true }],
            },
        },
    ]);
    const _privateFolderListQueryKey = computed(() => [
        ...privateFolderListQueryKey.value,
        {
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        },
    ]);


    /* Querys */
    const publicDashboardListQuery = useQuery({
        queryKey: _publicDashboardListQueryKey,
        queryFn: () => publicDashboardAPI.list({
            query: {
                ..._state.publicDashboardListApiQuery,
                sort: [{ key: 'created_at', desc: true }],
            },
        }),
        staleTime: 1000 * 60 * 5,
    });
    const privateDashboardListQuery = useQuery({
        queryKey: _privateDashboardListQueryKey,
        queryFn: () => privateDashboardAPI.list({
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        }),
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => !_state.isAdminMode),
    });
    const publicFolderListQuery = useQuery({
        queryKey: _publicFolderListQueryKey,
        queryFn: () => publicFolderAPI.list({
            query: {
                ..._state.publicFolderListApiQuery,
                sort: [{ key: 'created_at', desc: true }],
            },
        }),
        staleTime: 1000 * 60 * 5,
    });
    const privateFolderListQuery = useQuery({
        queryKey: _privateFolderListQueryKey,
        queryFn: () => privateFolderAPI.list({
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        }),
        staleTime: 1000 * 60 * 5,
        enabled: computed(() => !_state.isAdminMode),
    });

    // /* Mutations */
    // // public dashboard
    // const { mutateAsync: createPublicDashboard } = useMutation(
    //     {
    //         mutationFn: publicDashboardAPI.create,
    //         onSuccess: (dashboard: PublicDashboardModel) => {
    //             queryClient.setQueryData(_publicDashboardListQueryKey.value, (oldDashboards: Array<PublicDashboardModel>) => (oldDashboards ? [...oldDashboards, dashboard] : [dashboard]));
    //         },
    //         // onSuccess: (newDashboard) => {
    //         //     queryClient.invalidateQueries(_publicDashboardListQueryKey.value);
    //         // },
    //     },
    // );
    //
    // const { mutateAsync: updatePublicDashboard } = useMutation(
    //     {
    //         mutationFn: publicDashboardAPI.update,
    //         onSuccess: (dashboard: PublicDashboardModel) => {
    //             queryClient.setQueryData(_publicDashboardListQueryKey.value, (oldDashboards: Array<PublicDashboardModel>) => {
    //                 if (oldDashboards) {
    //                     const index = oldDashboards.findIndex((item) => item.dashboard_id === dashboard.dashboard_id);
    //                     if (index > -1) {
    //                         oldDashboards[index] = dashboard;
    //                     }
    //                 }
    //                 return oldDashboards;
    //             });
    //         },
    //     },
    // );
    //
    // const { mutateAsync: deletePublicDashboard } = useMutation(
    //     {
    //         mutationFn: publicDashboardAPI.delete,
    //         onSuccess: async (dashboard: PublicDashboardModel) => {
    //             queryClient.setQueryData(_publicDashboardListQueryKey.value, (oldDashboards: Array<PublicDashboardModel>) => {
    //                 if (oldDashboards) {
    //                     return oldDashboards.filter((item) => item.dashboard_id !== dashboard.dashboard_id);
    //                 }
    //                 return [];
    //             });
    //
    //             const isFavoriteItem = favoriteGetters.dashboardItems.find((item) => item.itemId === dashboard.dashboard_id);
    //             if (isFavoriteItem) {
    //                 await favoriteStore.deleteFavorite({
    //                     itemType: FAVORITE_TYPE.DASHBOARD,
    //                     workspaceId: _state.currentWorkspaceId || '',
    //                     itemId: dashboard.dashboard_id,
    //                 });
    //             }
    //         },
    //     },
    // );
    // // private dashboard
    // const { mutateAsync: createPrivateDashboard } = useMutation(
    //     {
    //         mutationFn: privateDashboardAPI.create,
    //         onSuccess: (dashboard: PrivateDashboardModel) => {
    //             queryClient.setQueryData(_privateDashboardListQueryKey.value, (oldDashboards: Array<PublicDashboardModel>) => (oldDashboards ? [...oldDashboards, dashboard] : [dashboard]));
    //         },
    //     },
    // );
    //
    // const { mutateAsync: updatePrivateDashboard } = useMutation(
    //     {
    //         mutationFn: privateDashboardAPI.update,
    //         onSuccess: (dashboard: PrivateDashboardModel) => {
    //             queryClient.setQueryData(_privateDashboardListQueryKey.value, (oldDashboards: Array<PrivateDashboardModel>) => {
    //                 if (oldDashboards) {
    //                     const index = oldDashboards.findIndex((item) => item.dashboard_id === dashboard.dashboard_id);
    //                     if (index > -1) {
    //                         oldDashboards[index] = dashboard;
    //                     }
    //                 }
    //                 return oldDashboards;
    //             });
    //         },
    //     },
    // );
    //
    // const { mutateAsync: deletePrivateDashboard } = useMutation(
    //     {
    //         mutationFn: privateDashboardAPI.delete,
    //         onSuccess: async (dashboard: PrivateDashboardModel) => {
    //             queryClient.setQueryData(_privateDashboardListQueryKey.value, (oldDashboards: Array<PrivateDashboardModel>) => {
    //                 if (oldDashboards) {
    //                     return oldDashboards.filter((item) => item.dashboard_id !== dashboard.dashboard_id);
    //                 }
    //                 return [];
    //             });
    //             const isFavoriteItem = favoriteGetters.dashboardItems.find((item) => item.itemId === dashboard.dashboard_id);
    //             if (isFavoriteItem) {
    //                 await favoriteStore.deleteFavorite({
    //                     itemType: FAVORITE_TYPE.DASHBOARD,
    //                     workspaceId: _state.currentWorkspaceId || '',
    //                     itemId: dashboard.dashboard_id,
    //                 });
    //             }
    //         },
    //     },
    // );
    // // public folder
    // const { mutateAsync: createPublicFolder } = useMutation(
    //     {
    //         mutationFn: publicFolderAPI.create,
    //         onSuccess: (folder: PublicFolderModel) => {
    //             queryClient.setQueryData(_publicFolderListQueryKey.value, (oldfolders: Array<PublicFolderModel>) => (oldfolders ? [...oldfolders, folder] : [folder]));
    //         },
    //     },
    // );
    // // private folder
    // const { mutateAsync: createPrivateFolder } = useMutation(
    //     {
    //         mutationFn: privateFolderAPI.create,
    //         onSuccess: (folder: PrivateFolderModel) => {
    //             queryClient.setQueryData(_privateFolderListQueryKey.value, (oldfolders: Array<PrivateFolderModel>) => (oldfolders ? [...oldfolders, folder] : [folder]));
    //         },
    //     },
    // );

    watch(() => _state.isAdminMode, () => {
        publicDashboardListApiQueryHelper.setFilters([]);
        publicFolderListApiQueryHelper.setFilters([]);
        if (_state.isAdminMode) {
            publicDashboardListApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
            publicFolderListApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
        } else {
            publicDashboardListApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '=' });
            publicFolderListApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '=' });
        }
        _state.publicDashboardListApiQuery = publicDashboardListApiQueryHelper.data;
        _state.publicFolderListApiQuery = publicFolderListApiQueryHelper.data;
    }, { immediate: true });

    return {
        publicDashboardItems: computed(() => publicDashboardListQuery.data.value?.results || []),
        privateDashboardItems: computed(() => privateDashboardListQuery.data.value?.results || []),
        publicFolderItems: computed(() => publicFolderListQuery.data.value?.results || []),
        privateFolderItems: computed(() => privateFolderListQuery.data.value?.results || []),
        loading: computed<boolean>(() => publicDashboardListQuery.isFetching.value || privateDashboardListQuery.isFetching.value
            || publicFolderListQuery.isFetching.value || privateFolderListQuery.isFetching.value),
        keys: {
            publicDashboardListQueryKey: _publicDashboardListQueryKey,
            privateDashboardListQueryKey: _privateDashboardListQueryKey,
            publicFolderListQueryKey: _publicFolderListQueryKey,
            privateFolderListQueryKey: _privateFolderListQueryKey,
        },
        api: {
            publicDashboardAPI,
            privateDashboardAPI,
            publicFolderAPI,
            privateFolderAPI,
        },
        queryClient,
    };
};

