import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import type { DashboardModel, DashboardUpdateParams } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardUpdateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/update';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardGetQueryOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardGetQueryReturn {
    dashboard: ComputedRef<PublicDashboardModel|PrivateDashboardModel|undefined>;
    isLoading: ComputedRef<boolean>;
    isError: ComputedRef<boolean>;
    keys: {
        publicDashboardGetQueryKey: ComputedRef<QueryKey>;
        privateDashboardGetQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicDashboardAPI: ReturnType<typeof usePublicDashboardApi>['publicDashboardAPI'];
        privateDashboardAPI: ReturnType<typeof usePrivateDashboardApi>['privateDashboardAPI'];
    };
    fetcher: {
        updateDashboardFn: (args: DashboardUpdateParams) => Promise<DashboardModel>
    };
}

export const useDashboardGetQuery = ({
    dashboardId,
}: UseDashboardGetQueryOptions): UseDashboardGetQueryReturn => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();

    const isPrivate = computed(() => !!dashboardId.value?.startsWith('private'));


    /* Query Keys */
    const { key: publicDashboardGetQueryKey, params: publicDashboardGetParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'get', {
        contextKey: computed(() => dashboardId.value),
        params: computed<PublicDashboardGetParameters>(() => ({
            dashboard_id: dashboardId.value as string,
        })),
    });
    const { key: privateDashboardGetQueryKey, params: privateDashboardGetParams } = useServiceQueryKey('dashboard', 'private-dashboard', 'get', {
        contextKey: computed(() => dashboardId.value),
        params: computed<PrivateDashboardGetParameters>(() => ({
            dashboard_id: dashboardId.value as string,
        })),
    });

    /* Querys */
    const publicDashboardQuery = useScopedQuery({
        queryKey: publicDashboardGetQueryKey,
        queryFn: () => publicDashboardAPI.get(publicDashboardGetParams.value),
        enabled: computed(() => !!dashboardId.value && !isPrivate.value),
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateDashboardQuery = useScopedQuery({
        queryKey: privateDashboardGetQueryKey,
        queryFn: () => privateDashboardAPI.get(privateDashboardGetParams.value),
        enabled: computed(() => !!dashboardId.value && isPrivate.value),
        staleTime: STALE_TIME,
    }, ['WORKSPACE']);

    /* Functions */
    const updateDashboardFn = (params: DashboardUpdateParams): Promise<DashboardModel> => {
        const _isPrivate = params.dashboard_id.startsWith('private');
        if (_isPrivate) {
            return privateDashboardAPI.update(params as PrivateDashboardUpdateParameters);
        }
        return publicDashboardAPI.update(params as PublicDashboardUpdateParameters);
    };

    /* State */
    const isLoading = computed<boolean>(() => (isPrivate.value
        ? (privateDashboardQuery.isFetching.value)
        : (publicDashboardQuery.isFetching.value)));
    const isError = computed<boolean>(() => (isPrivate.value
        ? (privateDashboardQuery.isError.value)
        : (publicDashboardQuery.isError.value)));

    return {
        dashboard: computed(() => (isPrivate.value ? privateDashboardQuery.data?.value : publicDashboardQuery.data?.value)),
        isLoading,
        isError,
        api: {
            publicDashboardAPI,
            privateDashboardAPI,
        },
        keys: {
            publicDashboardGetQueryKey,
            privateDashboardGetQueryKey,
        },
        fetcher: {
            updateDashboardFn,
        },
    };
};
