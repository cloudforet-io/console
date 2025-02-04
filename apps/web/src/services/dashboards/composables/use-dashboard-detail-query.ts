import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import type { QueryClient } from '@tanstack/vue-query';
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

interface UseDashboardDetailQueryOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardDetailQueryReturn {
    dashboard: ComputedRef<PublicDashboardModel|PrivateDashboardModel|undefined>;
    widgetList: ComputedRef<(PublicWidgetModel|PrivateWidgetModel)[]>;
    isLoading: ComputedRef<boolean>;
    isError: ComputedRef<boolean>;
    keys: Record<string, ComputedRef<unknown[]>>;
    api: Record<string, Record<string, (args: any) => Promise<any>>>;
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

    const _state = reactive({
        isPrivate: computed(() => !!dashboardId.value?.startsWith('private')),
    });

    const _publicDashboardQueryKey = computed(() => [
        ...publicDashboardQueryKey.value,
        dashboardId,
    ]);
    const _privateDashboardQueryKey = computed(() => [
        ...privateDashboardQueryKey.value,
        dashboardId,
    ]);
    const _publicWidgetListQueryKey = computed(() => [
        ...publicWidgetListQueryKey.value,
        dashboardId,
    ]);
    const _privateWidgetListQueryKey = computed(() => [
        ...privateWidgetListQueryKey.value,
        dashboardId,
    ]);

    /* Querys */
    const publicDashboardQuery = useQuery({
        queryKey: _publicDashboardQueryKey,
        queryFn: () => publicDashboardAPI.get({
            dashboard_id: dashboardId.value as string,
        }),
        enabled: computed(() => !!dashboardId.value && !_state.isPrivate),
        staleTime: 1000 * 60 * 5,
    });
    const privateDashboardQuery = useQuery({
        queryKey: _privateDashboardQueryKey,
        queryFn: () => privateDashboardAPI.get({
            dashboard_id: dashboardId.value as string,
        }),
        enabled: computed(() => !!dashboardId.value && _state.isPrivate),
        staleTime: 1000 * 60 * 5,
    });
    const publicWidgetListQuery = useQuery({
        queryKey: _publicWidgetListQueryKey,
        queryFn: () => publicWidgetAPI.list({
            dashboard_id: dashboardId.value as string,
        }),
        enabled: computed(() => !!dashboardId.value && publicDashboardQuery.isSuccess && !_state.isPrivate),
        staleTime: 1000 * 60 * 5,
    });
    const privateWidgetListQuery = useQuery({
        queryKey: _privateWidgetListQueryKey,
        queryFn: () => privateWidgetAPI.list({
            dashboard_id: dashboardId.value as string,
        }),
        enabled: computed(() => !!dashboardId.value && privateDashboardQuery.isSuccess && _state.isPrivate),
        staleTime: 1000 * 60 * 5,
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
    const isLoading = computed(() => (_state.isPrivate
        ? (privateDashboardQuery.isFetching.value || privateWidgetListQuery.isFetching.value)
        : (publicWidgetListQuery.isFetching.value || publicDashboardQuery.isFetching.value)));
    const isError = computed(() => (_state.isPrivate
        ? (privateDashboardQuery.isError.value || privateWidgetListQuery.isError.value)
        : (publicDashboardQuery.isError.value || publicWidgetListQuery.isError.value)));

    return {
        dashboard: computed(() => (_state.isPrivate ? privateDashboardQuery.data?.value : publicDashboardQuery.data?.value)),
        widgetList: computed(() => (_state.isPrivate ? privateWidgetListQuery.data?.value?.results : publicWidgetListQuery.data?.value?.results) || []),
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
