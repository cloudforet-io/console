import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryClient, QueryKey } from '@tanstack/vue-query';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

import type { DashboardModel, DashboardUpdateParams } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardUpdateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/update';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardDetailQueryOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardDetailQueryReturn {
    dashboard: ComputedRef<PublicDashboardModel|PrivateDashboardModel|undefined>;
    widgetList: ComputedRef<(PublicWidgetModel|PrivateWidgetModel)[]>;
    isLoading: ComputedRef<boolean>;
    isError: ComputedRef<boolean>;
    keys: {
        publicDashboardQueryKey: ComputedRef<QueryKey>;
        privateDashboardQueryKey: ComputedRef<QueryKey>;
        publicWidgetListQueryKey: ComputedRef<QueryKey>;
        privateWidgetListQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicDashboardAPI: ReturnType<typeof usePublicDashboardApi>['publicDashboardAPI'];
        privateDashboardAPI: ReturnType<typeof usePrivateDashboardApi>['privateDashboardAPI'];
        publicWidgetAPI: ReturnType<typeof usePublicWidgetApi>['publicWidgetAPI'];
        privateWidgetAPI: ReturnType<typeof usePrivateWidgetApi>['privateWidgetAPI'];
    };
    fetcher: {
        updateDashboardFn: (args: DashboardUpdateParams) => Promise<DashboardModel>
    };
    queryClient: QueryClient;
}

export const useDashboardDetailQuery = ({
    dashboardId,
}: UseDashboardDetailQueryOptions): UseDashboardDetailQueryReturn => {
    const { publicDashboardAPI, publicDashboardQueryKey } = usePublicDashboardApi();
    const { privateDashboardAPI, privateDashboardQueryKey } = usePrivateDashboardApi();
    const { publicWidgetAPI, publicWidgetListQueryKey } = usePublicWidgetApi();
    const { privateWidgetAPI, privateWidgetListQueryKey } = usePrivateWidgetApi();
    const queryClient = useQueryClient();

    const isPrivate = computed(() => !!dashboardId.value?.startsWith('private'));

    /* Query Keys */
    const _publicDashboardQueryKey = computed(() => [
        ...publicDashboardQueryKey.value,
        dashboardId.value,
    ]);
    const _privateDashboardQueryKey = computed(() => [
        ...privateDashboardQueryKey.value,
        dashboardId.value,
    ]);
    const _publicWidgetListQueryKey = computed(() => [
        ...publicWidgetListQueryKey.value,
        dashboardId.value,
    ]);
    const _privateWidgetListQueryKey = computed(() => [
        ...privateWidgetListQueryKey.value,
        dashboardId.value,
    ]);

    /* Querys */
    const publicDashboardQuery = useQuery({
        queryKey: _publicDashboardQueryKey,
        queryFn: () => publicDashboardAPI.get({
            dashboard_id: dashboardId.value as string,
        }),
        enabled: computed(() => !!dashboardId.value && !isPrivate.value),
        staleTime: STALE_TIME,
    });
    const privateDashboardQuery = useQuery({
        queryKey: _privateDashboardQueryKey,
        queryFn: () => privateDashboardAPI.get({
            dashboard_id: dashboardId.value as string,
        }),
        enabled: computed(() => !!dashboardId.value && isPrivate.value),
        staleTime: STALE_TIME,
    });
    const publicWidgetListQuery = useQuery({
        queryKey: _publicWidgetListQueryKey,
        queryFn: () => publicWidgetAPI.list({
            dashboard_id: dashboardId.value as string,
        }),
        select: (data) => data?.results || [],
        enabled: computed(() => !!dashboardId.value && publicDashboardQuery.isSuccess && !isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    });
    const privateWidgetListQuery = useQuery({
        queryKey: _privateWidgetListQueryKey,
        queryFn: () => privateWidgetAPI.list({
            dashboard_id: dashboardId.value as string,
        }),
        select: (data) => data?.results || [],
        enabled: computed(() => !!dashboardId.value && privateDashboardQuery.isSuccess && isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    });

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
        ? (privateDashboardQuery.isFetching.value || privateWidgetListQuery.isFetching.value)
        : (publicWidgetListQuery.isFetching.value || publicDashboardQuery.isFetching.value)));
    const isError = computed<boolean>(() => (isPrivate.value
        ? (privateDashboardQuery.isError.value || privateWidgetListQuery.isError.value)
        : (publicDashboardQuery.isError.value || publicWidgetListQuery.isError.value)));

    return {
        dashboard: computed(() => (isPrivate.value ? privateDashboardQuery.data?.value : publicDashboardQuery.data?.value)),
        widgetList: computed(() => (isPrivate.value ? privateWidgetListQuery.data?.value : publicWidgetListQuery.data?.value)),
        isLoading,
        isError,
        api: {
            publicDashboardAPI,
            privateDashboardAPI,
            publicWidgetAPI,
            privateWidgetAPI,
        },
        keys: {
            publicDashboardQueryKey: _publicDashboardQueryKey,
            privateDashboardQueryKey: _privateDashboardQueryKey,
            publicWidgetListQueryKey: _publicWidgetListQueryKey,
            privateWidgetListQueryKey: _privateWidgetListQueryKey,
        },
        fetcher: {
            updateDashboardFn,
        },
        queryClient,
    };
};
