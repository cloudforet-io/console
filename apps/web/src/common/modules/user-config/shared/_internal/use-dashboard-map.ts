import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

const privateDashboardListApiQueryHelper = new ApiQueryHelper().setOnly('dashboard_id', 'name');
const publicDashboardListApiQueryHelper = new ApiQueryHelper().setFilters([
    { k: 'resource_group', v: 'WORKSPACE', o: '=' },
]).setOnly('dashboard_id', 'name');


export const useDashboardMap = () => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();

    const { key: publicDashboardKey, params: publicDashboardParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
        params: {
            query: publicDashboardListApiQueryHelper.data,
        },
    });

    const { key: privateDashboardKey, params: privateDashboardParams } = useServiceQueryKey('dashboard', 'private-dashboard', 'list', {
        params: {
            query: privateDashboardListApiQueryHelper.data,
        },
    });
    const { data: publicDashboardList, isFetching: isFetchingPublicDashboardList } = useScopedQuery({
        queryKey: publicDashboardKey,
        queryFn: () => publicDashboardAPI.list(publicDashboardParams.value),
        select: (data) => data.results || [],
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['WORKSPACE']);

    const { data: privateDashboardList, isFetching: isFetchingPrivateDashboardList } = useScopedQuery({
        queryKey: privateDashboardKey,
        queryFn: () => privateDashboardAPI.list(privateDashboardParams.value),
        select: (data) => data.results || [],
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['WORKSPACE']);


    return {
        map: computed(() => {
            const dashboardMap = new Map<string, DashboardModel>();
            publicDashboardList.value?.forEach((d) => {
                dashboardMap.set(d.dashboard_id, d);
            });

            privateDashboardList.value?.forEach((d) => {
                dashboardMap.set(d.dashboard_id, d);
            });

            return dashboardMap;
        }),
        loading: computed(() => isFetchingPublicDashboardList.value || isFetchingPrivateDashboardList.value),
    };
};
