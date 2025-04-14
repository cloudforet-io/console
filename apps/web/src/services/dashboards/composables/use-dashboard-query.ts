import type { Ref } from 'vue';
import {
    computed, type ComputedRef, reactive, watch,
} from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useAppContextStore } from '@/store/app-context/app-context-store';


const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardQueryReturn {
    publicDashboardList: Ref<PublicDashboardModel[]>;
    privateDashboardList: Ref<PrivateDashboardModel[]>;
    isLoading: ComputedRef<boolean>;
    keys: {
        publicDashboardListQueryKey: ComputedRef<QueryKey>;
        privateDashboardListQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicDashboardAPI: ReturnType<typeof usePublicDashboardApi>['publicDashboardAPI'];
        privateDashboardAPI: ReturnType<typeof usePrivateDashboardApi>['privateDashboardAPI'];
    };
}

export const useDashboardQuery = (): UseDashboardQueryReturn => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();

    const appContextStore = useAppContextStore();
    const publicDashboardListApiQueryHelper = new ApiQueryHelper();

    const _state = reactive({
        // Store State
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
        // state
        publicDashboardListApiQuery: publicDashboardListApiQueryHelper.data,
        defaultListQuery: {
            sort: [{ key: 'created_at', desc: true }],
        },
    });

    /* Query Keys */
    const { key: publicDashboardListQueryKey, params: publicDashboardListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
        params: computed(() => ({
            query: {
                filter: _state.publicDashboardListApiQuery.filter,
                ..._state.defaultListQuery,
            },
        })),
    });
    const { key: privateDashboardListQueryKey, params: privateDashboardListParams } = useServiceQueryKey('dashboard', 'private-dashboard', 'list', {
        params: computed(() => ({
            query: _state.defaultListQuery,
        })),
    });

    /* Querys */
    const publicDashboardListQuery = useScopedQuery({
        queryKey: publicDashboardListQueryKey,
        queryFn: () => publicDashboardAPI.list(publicDashboardListParams.value),
        select: (data) => data?.results ?? [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !!_state.publicDashboardListApiQuery?.filter),
    }, ['DOMAIN', 'WORKSPACE']);
    const privateDashboardListQuery = useScopedQuery({
        queryKey: privateDashboardListQueryKey,
        queryFn: () => privateDashboardAPI.list(privateDashboardListParams.value),
        select: (data) => data?.results || [],
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
        enabled: computed(() => !_state.isAdminMode),
    }, ['WORKSPACE']);

    watch(() => _state.isAdminMode, () => {
        publicDashboardListApiQueryHelper.setFilters([]);
        if (_state.isAdminMode) {
            publicDashboardListApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
        } else {
            publicDashboardListApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '' });
        }
        _state.publicDashboardListApiQuery = publicDashboardListApiQueryHelper.data;
    }, { immediate: true });

    const isLoading = computed<boolean>(() => publicDashboardListQuery.isFetching.value || privateDashboardListQuery.isFetching.value);

    return {
        publicDashboardList: computed<PublicDashboardModel[]>(() => publicDashboardListQuery.data.value ?? []),
        privateDashboardList: computed<PrivateDashboardModel[]>(() => privateDashboardListQuery.data.value ?? []),
        isLoading,
        keys: {
            publicDashboardListQueryKey,
            privateDashboardListQueryKey,
        },
        api: {
            publicDashboardAPI,
            privateDashboardAPI,
        },
    };
};

