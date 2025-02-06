import type { Ref } from 'vue';
import {
    computed, type ComputedRef, reactive, watch,
} from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { FolderModel, FolderUpdateParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useUserStore } from '@/store/user/user-store';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardQueryReturn {
    publicDashboardList: Ref<PublicDashboardModel[]>;
    privateDashboardList: Ref<PrivateDashboardModel[]>;
    publicFolderList: Ref<FolderModel[]>;
    privateFolderList: Ref<FolderModel[]>;
    isLoading: ComputedRef<boolean>;
    keys: {
        publicDashboardListQueryKey: ComputedRef<QueryKey>;
        privateDashboardListQueryKey: ComputedRef<QueryKey>;
        publicFolderListQueryKey: ComputedRef<QueryKey>;
        privateFolderListQueryKey: ComputedRef<QueryKey>;
    };
    fetcher: {
        updateFolderFn: (args: FolderUpdateParams) => Promise<FolderModel>
    };
    api: {
        publicDashboardAPI: ReturnType<typeof usePublicDashboardApi>['publicDashboardAPI'];
        privateDashboardAPI: ReturnType<typeof usePrivateDashboardApi>['privateDashboardAPI'];
        publicFolderAPI: ReturnType<typeof usePublicFolderApi>['publicFolderAPI'];
        privateFolderAPI: ReturnType<typeof usePrivateFolderApi>['privateFolderAPI'];
    };
    queryClient: QueryClient;
}

export const useDashboardQuery = (): UseDashboardQueryReturn => {
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
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
        costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
        userId: computed<string|undefined>(() => userStore.state.userId),
        // state
        publicDashboardListApiQuery: publicDashboardListApiQueryHelper.data,
        publicFolderListApiQuery: publicFolderListApiQueryHelper.data,
        defaultListQuery: {
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        },
    });

    /* Query Keys */
    const _publicDashboardListQueryKey = computed(() => [
        ...publicDashboardListQueryKey.value,
        _state.defaultListQuery,
    ]);
    const _privateDashboardListQueryKey = computed(() => [
        ...privateDashboardListQueryKey.value,
        _state.defaultListQuery,
    ]);
    const _publicFolderListQueryKey = computed(() => [
        ...publicFolderListQueryKey.value,
        _state.defaultListQuery,
    ]);
    const _privateFolderListQueryKey = computed(() => [
        ...privateFolderListQueryKey.value,
        _state.defaultListQuery,
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
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    });
    const privateDashboardListQuery = useQuery({
        queryKey: _privateDashboardListQueryKey,
        queryFn: () => privateDashboardAPI.list({
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        }),
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
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
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    });
    const privateFolderListQuery = useQuery({
        queryKey: _privateFolderListQueryKey,
        queryFn: () => privateFolderAPI.list({
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        }),
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
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

    const isLoading = computed<boolean>(() => publicDashboardListQuery.isFetching.value || privateDashboardListQuery.isFetching.value
        || publicFolderListQuery.isFetching.value || privateFolderListQuery.isFetching.value);

    return {
        publicDashboardList: publicDashboardListQuery.data,
        privateDashboardList: privateDashboardListQuery.data,
        publicFolderList: publicFolderListQuery.data,
        privateFolderList: privateFolderListQuery.data,
        isLoading,
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

