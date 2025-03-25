import type { Ref } from 'vue';
import {
    computed, type ComputedRef, reactive, watch,
} from 'vue';

import { type QueryClient, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { FolderModel, FolderUpdateParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import type { QueryKeyArray } from '@/query/_types/query-key-type';
import { _useAPIQueryKey } from '@/query/composables/use-api-query-key';

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
    publicFolderList: Ref<PublicFolderModel[]>;
    privateFolderList: Ref<PrivateFolderModel[]>;
    isLoading: ComputedRef<boolean>;
    keys: {
        publicDashboardListQueryKey: ComputedRef<QueryKeyArray>;
        privateDashboardListQueryKey: ComputedRef<QueryKeyArray>;
        publicFolderListQueryKey: ComputedRef<QueryKeyArray>;
        privateFolderListQueryKey: ComputedRef<QueryKeyArray>;
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
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const { publicFolderAPI } = usePublicFolderApi();
    const { privateFolderAPI } = usePrivateFolderApi();


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

    /* Query Keys and Params */
    const { key: publicDashboardListQueryKey, params: publicDashboardListParams } = _useAPIQueryKey('dashboard', 'public-dashboard', 'list', {
        params: computed(() => ({
            query: {
                ..._state.publicDashboardListApiQuery,
                ..._state.defaultListQuery.query,
            },
        })),
    });
    const { key: privateDashboardListQueryKey, params: privateDashboardListParams } = _useAPIQueryKey('dashboard', 'private-dashboard', 'list', {
        params: computed(() => _state.defaultListQuery),
    });
    const { key: publicFolderListQueryKey, params: publicFolderListParams } = _useAPIQueryKey('dashboard', 'public-folder', 'list', {
        params: computed(() => ({
            query: {
                ..._state.publicFolderListApiQuery,
                ..._state.defaultListQuery.query,
            },
        })),
    });
    const { key: privateFolderListQueryKey, params: privateFolderListParams } = _useAPIQueryKey('dashboard', 'private-folder', 'list', {
        params: computed(() => _state.defaultListQuery),
    });

    /* Querys */
    const publicDashboardListQuery = useScopedQuery<ListResponse<PublicDashboardModel>, unknown, PublicDashboardModel[]>({
        queryKey: publicDashboardListQueryKey,
        queryFn: () => publicDashboardAPI.list(publicDashboardListParams.value),
        select: (data) => data?.results ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !!_state.publicDashboardListApiQuery?.filter),
    }, ['DOMAIN', 'WORKSPACE']);

    const privateDashboardListQuery = useScopedQuery<ListResponse<PrivateDashboardModel>, unknown, PrivateDashboardModel[]>({
        queryKey: privateDashboardListQueryKey,
        queryFn: () => privateDashboardAPI.list(privateDashboardListParams.value),
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !_state.isAdminMode),
    }, ['WORKSPACE']);
    const publicFolderListQuery = useScopedQuery<ListResponse<PublicFolderModel>, unknown, PublicFolderModel[]>({
        queryKey: publicFolderListQueryKey,
        queryFn: () => publicFolderAPI.list(publicFolderListParams.value),
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !!_state.publicFolderListApiQuery?.filter),
    }, ['DOMAIN', 'WORKSPACE']);
    const privateFolderListQuery = useScopedQuery<ListResponse<PrivateFolderModel>, unknown, PrivateFolderModel[]>({
        queryKey: privateFolderListQueryKey,
        queryFn: () => privateFolderAPI.list(privateFolderListParams.value),
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !_state.isAdminMode),
    }, ['WORKSPACE']);

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
        publicDashboardList: computed<PublicDashboardModel[]>(() => publicDashboardListQuery.data.value ?? []),
        privateDashboardList: computed<PrivateDashboardModel[]>(() => privateDashboardListQuery.data.value ?? []),
        publicFolderList: computed<PublicFolderModel[]>(() => publicFolderListQuery.data.value ?? []),
        privateFolderList: computed<PrivateFolderModel[]>(() => privateFolderListQuery.data.value ?? []),
        isLoading,
        keys: {
            publicDashboardListQueryKey,
            privateDashboardListQueryKey,
            publicFolderListQueryKey,
            privateFolderListQueryKey,
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

