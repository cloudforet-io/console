import type { Ref } from 'vue';
import {
    computed, type ComputedRef, reactive, watch,
} from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { FolderModel, FolderUpdateParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePrivateFolderApi } from '@/api-clients/dashboard/private-folder/composables/use-private-folder-api';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useAppContextStore } from '@/store/app-context/app-context-store';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardFolderQueryReturn {
    publicFolderList: Ref<PublicFolderModel[]>;
    privateFolderList: Ref<PrivateFolderModel[]>;
    isLoading: ComputedRef<boolean>;
    keys: {
        publicFolderListQueryKey: ComputedRef<QueryKey>;
        privateFolderListQueryKey: ComputedRef<QueryKey>;
    };
    fetcher: {
        updateFolderFn: (args: FolderUpdateParams) => Promise<FolderModel>
    };
    api: {
        publicFolderAPI: ReturnType<typeof usePublicFolderApi>['publicFolderAPI'];
        privateFolderAPI: ReturnType<typeof usePrivateFolderApi>['privateFolderAPI'];
    };
}

export const useDashboardFolderQuery = (): UseDashboardFolderQueryReturn => {
    const { publicFolderAPI } = usePublicFolderApi();
    const { privateFolderAPI } = usePrivateFolderApi();


    const appContextStore = useAppContextStore();
    const publicFolderListApiQueryHelper = new ApiQueryHelper();

    const _state = reactive({
        // Store State
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        // state
        publicFolderListApiQuery: publicFolderListApiQueryHelper.data,
        defaultListQuery: {
            sort: [{ key: 'created_at', desc: true }],
        },
    });

    /* Query Keys */
    const { key: publicFolderListQueryKey, params: publicFolderListParams } = useServiceQueryKey('dashboard', 'public-folder', 'list', {
        params: computed(() => ({
            query: {
                filter: _state.publicFolderListApiQuery.filter,
                ..._state.defaultListQuery,
            },
        })),
    });
    const { key: privateFolderListQueryKey, params: privateFolderListParams } = useServiceQueryKey('dashboard', 'private-folder', 'list', {
        params: computed(() => ({
            query: _state.defaultListQuery,
        })),
    });

    /* Querys */
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
        publicFolderListApiQueryHelper.setFilters([]);
        if (_state.isAdminMode) {
            publicFolderListApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
        } else {
            publicFolderListApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '=' });
        }
        _state.publicFolderListApiQuery = publicFolderListApiQueryHelper.data;
    }, { immediate: true });

    const isLoading = computed<boolean>(() => publicFolderListQuery.isFetching.value || privateFolderListQuery.isFetching.value);

    return {
        publicFolderList: computed<PublicFolderModel[]>(() => publicFolderListQuery.data.value ?? []),
        privateFolderList: computed<PrivateFolderModel[]>(() => privateFolderListQuery.data.value ?? []),
        isLoading,
        keys: {
            publicFolderListQueryKey,
            privateFolderListQueryKey,
        },
        fetcher: {
            updateFolderFn,
        },
        api: {
            publicFolderAPI,
            privateFolderAPI,
        },
    };
};

