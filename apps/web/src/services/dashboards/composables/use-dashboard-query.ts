import {
    computed, reactive, watch,
} from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { FolderModel, FolderUpdateParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useUserStore } from '@/store/user/user-store';


export const useDashboardQuery = () => {
    const { publicDashboardAPI, publicDashboardListQueryKey } = usePublicDashboardApi();
    const { privateDashboardAPI, privateDashboardListQueryKey } = usePrivateDashboardApi();
    const { publicFolderAPI, publicFolderListQueryKey } = usePublicFolderApi();
    const { privateFolderAPI, privateFolderListQueryKey } = usePrivateFolderApi();
    const queryClient = useQueryClient();

    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
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

    /* Fetchers */
    const updateFolderFn = (params: FolderUpdateParams): Promise<FolderModel> => {
        const _isPrivate = params.folder_id.startsWith('private');
        if (_isPrivate) {
            return privateFolderAPI.update(params as PrivateFolderUpdateParameters);
        }
        return publicFolderAPI.update(params as PublicFolderUpdateParameters);
    };

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
        fetcher: {
            updateFolderFn,
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

