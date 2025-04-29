import {
    computed,
} from 'vue';


import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useAppContextStore } from '@/store/app-context/app-context-store';


const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

const publicDashboardListApiQueryHelper = new ApiQueryHelper().addFilter({ k: 'resource_group', v: 'WORKSPACE', o: '=' });

export const useGlobalDashboardQuery = () => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();

    const appContextStore = useAppContextStore();
    const _isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

    /* Query Keys */
    const { key: publicDashboardListQueryKey, params: publicDashboardListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
        params: computed(() => ({
            query: {
                filter: publicDashboardListApiQueryHelper.data.filter,
            },
        })),
    });
    const { key: privateDashboardListQueryKey, params: privateDashboardListParams } = useServiceQueryKey('dashboard', 'private-dashboard', 'list', {
        params: computed(() => ({})),
    });

    return {
        publicDashboardListQuery: useScopedQuery({
            queryKey: publicDashboardListQueryKey,
            queryFn: () => publicDashboardAPI.list(publicDashboardListParams.value),
            select: (data) => data?.results ?? [],
            initialData: DEFAULT_LIST_DATA,
            initialDataUpdatedAt: 0,
            staleTime: STALE_TIME,
            enabled: computed(() => !_isAdminMode.value),
        }, ['WORKSPACE']),
        privateDashboardListQuery: useScopedQuery({
            queryKey: privateDashboardListQueryKey,
            queryFn: () => privateDashboardAPI.list(privateDashboardListParams.value),
            select: (data) => data?.results || [],
            initialData: DEFAULT_LIST_DATA,
            initialDataUpdatedAt: 0,
            staleTime: STALE_TIME,
            enabled: computed(() => !_isAdminMode.value),
        }, ['WORKSPACE']),
    };
};

