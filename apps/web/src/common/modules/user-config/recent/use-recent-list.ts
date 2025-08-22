import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';


import { MENU_ID } from '@/lib/menu/config';

import type { RecentType } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';


export interface RecentOriginConfig {
    id: string;
    label: string;
    type: RecentType;
    workspace_id: string;
    [key: string]: any;
}

export type RecentItem = UserConfigModel<RecentOriginConfig>;


interface UseRecentListOptions {
    limit?: number;
}

const recentListBaseApiQuery = new ApiQueryHelper().setSort('updated_at', true);

export const useRecentList = ({ limit = 15 }: UseRecentListOptions = {}) => {
    const userStore = useUserStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const userId = computed<string|undefined>(() => userStore.state.userId);
    const currentWorkspaceId = computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId);

    const getRecentListParams = computed(() => {
        recentListBaseApiQuery.setFilters([
            { k: 'user_id', v: userId.value || '', o: '=' },
        ]);
        return (type: RecentType) => {
            const recentListApiQuery = new ApiQueryHelper().setFilters([
                ...recentListBaseApiQuery.filters,
                { k: 'name', v: `console:recent:${type}:`, o: '' },
            ]).setPageLimit(limit);

            if (type !== RECENT_TYPE.WORKSPACE && currentWorkspaceId.value) {
                recentListApiQuery.addFilter({ k: 'data.workspace_id', v: currentWorkspaceId.value, o: '=' });
            }
            return {
                query: recentListApiQuery.data,
            };
        };
    });

    const { data: menuRecentList, isFetching: isFetchingMenuRecentList } = useRecentQueryByType({
        params: computed(() => {
            const recentListApiQuery = new ApiQueryHelper().setFilters([
                ...recentListBaseApiQuery.filters,
                { k: 'name', v: 'console:recent:', o: '' },
                { k: 'data.type', v: RECENT_TYPE.WORKSPACE, o: '!=' },
                { k: 'data.id', v: MENU_ID.WORKSPACE_HOME, o: '!=' },
                // NOTE: Code corresponding to data stored as 'home-dashboard'
                { k: 'data.id', v: 'home-dashboard', o: '!=' },
            ]);
            // .setPageLimit(limit); // TODO: find solution for this

            if (currentWorkspaceId.value) {
                recentListApiQuery.addFilter({ k: 'data.workspace_id', v: currentWorkspaceId.value, o: '=' });
            }
            return {
                query: recentListApiQuery.data,
            };
        }),
        enabled: computed(() => {
            if (!userId.value) return false;
            return true;
        }),
    });


    const { data: workspaceRecentList, isFetching: isFetchingWorkspaceRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.WORKSPACE,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.WORKSPACE)),
        enabled: computed(() => {
            if (!userId.value) return false;
            return true;
        }),
    });

    const { data: serviceRecentList, isFetching: isFetchingServiceRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.SERVICE,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.SERVICE)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: serviceAccountRecentList, isFetching: isFetchingServiceAccountRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.SERVICE_ACCOUNT,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.SERVICE_ACCOUNT)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: trustedAccountRecentList, isFetching: isFetchingTrustedAccountRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.TRUSTED_ACCOUNT,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.TRUSTED_ACCOUNT)),
        enabled: computed(() => {
            if (!userId.value) return false;
            return true;
        }),
    });

    const { data: projectRecentList, isFetching: isFetchingProjectRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.PROJECT,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.PROJECT)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: projectGroupRecentList, isFetching: isFetchingProjectGroupRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.PROJECT_GROUP,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.PROJECT_GROUP)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: dashboardRecentList, isFetching: isFetchingDashboardRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.DASHBOARD,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.DASHBOARD)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: cloudServiceRecentList, isFetching: isFetchingCloudServiceRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.CLOUD_SERVICE,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.CLOUD_SERVICE)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: cloudServiceTypeRecentList, isFetching: isFetchingCloudServiceTypeRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.CLOUD_SERVICE_TYPE,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.CLOUD_SERVICE_TYPE)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    const { data: costAnalysisRecentList, isFetching: isFetchingCostAnalysisRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.COST_ANALYSIS,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.COST_ANALYSIS)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    // const { data: metricExplorerRecentList, isFetching: isFetchingMetricExplorerRecentList } = useRecentQueryByType({
    //     type: RECENT_TYPE.METRIC_EXPLORER,
    //     params: computed(() => getRecentListParams.value(RECENT_TYPE.METRIC_EXPLORER)),
    //     enabled: computed(() => {
    //         if (!userId.value) return false;
    //         if (!currentWorkspaceId.value) return false;
    //         return true;
    //     }),
    // });

    const { data: securityRecentList, isFetching: isFetchingSecurityRecentList } = useRecentQueryByType({
        type: RECENT_TYPE.SECURITY,
        params: computed(() => getRecentListParams.value(RECENT_TYPE.SECURITY)),
        enabled: computed(() => {
            if (!userId.value) return false;
            if (!currentWorkspaceId.value) return false;
            return true;
        }),
    });

    return {
        menuRecentList,
        workspaceRecentList,
        serviceRecentList,
        serviceAccountRecentList,
        trustedAccountRecentList,
        projectRecentList,
        projectGroupRecentList,
        dashboardRecentList,
        cloudServiceRecentList,
        cloudServiceTypeRecentList,
        costAnalysisRecentList,
        // metricExplorerRecentList,
        securityRecentList,
        workspaceRecentLoading: isFetchingWorkspaceRecentList,
        recentLoading: computed(() => isFetchingMenuRecentList.value
                || isFetchingWorkspaceRecentList.value
                || isFetchingServiceRecentList.value
                || isFetchingServiceAccountRecentList.value
                || isFetchingTrustedAccountRecentList.value
                || isFetchingProjectRecentList.value
                || isFetchingProjectGroupRecentList.value
                || isFetchingDashboardRecentList.value
                || isFetchingCloudServiceRecentList.value
                || isFetchingCloudServiceTypeRecentList.value
                || isFetchingCostAnalysisRecentList.value
                // || isFetchingMetricExplorerRecentList.value
                || isFetchingSecurityRecentList.value),
    };
};

interface UseRecentListByTypeOptions {
    type?: RecentType;
    params: ComputedRef<UserConfigListParameters>;
    enabled: ComputedRef<boolean>;
}

const useRecentQueryByType = ({ type, params, enabled }: UseRecentListByTypeOptions) => {
    const { userConfigAPI } = useUserConfigApi();

    const { key, params: queryParams } = useServiceQueryKey('config', 'user-config', 'list', {
        contextKey: type ? `console:recent:${type}:` : 'console:recent:',
        params,
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => userConfigAPI.list<RecentOriginConfig>(queryParams.value),
        select: (data) => data?.results ?? [],
        enabled,
    }, ['WORKSPACE', 'USER']);
};
