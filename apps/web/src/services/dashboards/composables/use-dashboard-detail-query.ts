import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryClient, QueryKey } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import type { DashboardModel, DashboardUpdateParams } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PrivateWidgetListParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/list';
import type { PrivateWidgetUpdateParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/update';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardUpdateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/update';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import type { PublicWidgetListParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/list';
import type { PublicWidgetUpdateParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/update';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

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
        publicDashboardGetQueryKey: ComputedRef<QueryKey>;
        privateDashboardGetQueryKey: ComputedRef<QueryKey>;
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
        updateWidgetFn: (args: WidgetUpdateParams) => Promise<WidgetModel>
    };
    queryClient: QueryClient;
}

export const useDashboardDetailQuery = ({
    dashboardId,
}: UseDashboardDetailQueryOptions): UseDashboardDetailQueryReturn => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const { publicWidgetAPI } = usePublicWidgetApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();
    const queryClient = useQueryClient();

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
    const { key: publicWidgetListQueryKey, params: publicWidgetListParams } = useServiceQueryKey('dashboard', 'public-widget', 'list', {
        params: computed<PublicWidgetListParameters>(() => ({
            dashboard_id: dashboardId.value as string,
        })),
    });
    const { key: privateWidgetListQueryKey, params: privateWidgetListParams } = useServiceQueryKey('dashboard', 'private-widget', 'list', {
        params: computed<PrivateWidgetListParameters>(() => ({
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
    const publicWidgetListQuery = useScopedQuery({
        queryKey: publicWidgetListQueryKey,
        queryFn: () => publicWidgetAPI.list(publicWidgetListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!dashboardId.value && publicDashboardQuery.isSuccess && !isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateWidgetListQuery = useScopedQuery({
        queryKey: privateWidgetListQueryKey,
        queryFn: () => privateWidgetAPI.list(privateWidgetListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!dashboardId.value && privateDashboardQuery.isSuccess && isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
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
    const updateWidgetFn = (params: WidgetUpdateParams): Promise<WidgetModel> => {
        const _isPrivate = params.widget_id.startsWith('private');
        if (_isPrivate) {
            return privateWidgetAPI.update(params as PrivateWidgetUpdateParameters);
        }
        return publicWidgetAPI.update(params as PublicWidgetUpdateParameters);
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
        widgetList: computed(() => (isPrivate.value ? privateWidgetListQuery.data?.value : publicWidgetListQuery.data?.value) ?? []),
        isLoading,
        isError,
        api: {
            publicDashboardAPI,
            privateDashboardAPI,
            publicWidgetAPI,
            privateWidgetAPI,
        },
        keys: {
            publicDashboardGetQueryKey,
            privateDashboardGetQueryKey,
            publicWidgetListQueryKey,
            privateWidgetListQueryKey,
        },
        fetcher: {
            updateDashboardFn,
            updateWidgetFn,
        },
        queryClient,
    };
};
