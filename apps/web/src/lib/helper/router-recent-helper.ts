import type { Route } from 'vue-router';

import type { QueryClient } from '@tanstack/vue-query';

import { useUserConfigApi as getUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';

import { getCompoundKeyWithManagedCostQuerySetFavoriteKey } from '@/lib/helper/config-data-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

// import ErrorHandler from '@/common/composables/error/errorHandler';
import type { RecentType } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { MANAGED_COST_QUERY_SET_ID_LIST } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';



const recentSetHandler = async (recentConfig: RecentConfig, queryClient: QueryClient) => {
    const { userConfigAPI } = getUserConfigApi();
    const { itemType, workspaceId, itemId } = recentConfig;

    try {
        await userConfigAPI.set({
            name: `console:recent:${itemType}:${workspaceId}:${itemId}`,
            data: {
                id: itemId,
                workspace_id: workspaceId,
                type: itemType,
                label: itemId,
            },
        });
        queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'config', 'user-config', 'list', `console:recent:${itemType}`] });
    } catch (e) {
        // ErrorHandler.handleError(e);
        console.error(e);
    }
};


interface RecentConfig {
    itemType: RecentType;
    workspaceId: string;
    itemId: string;
    updatedAt?: string;
}



export const setRecentConfig = async (to: Route, queryClient: QueryClient) => {
    const workspaceId = to.params.workspaceId;

    /* DASHBOARD */
    if (to.name === DASHBOARDS_ROUTE.DETAIL._NAME) {
        const dashboardId = to?.params?.dashboardId;
        if (!dashboardId) return;
        const isPublicDashboard = dashboardId.startsWith('public');
        if (isPublicDashboard) {
            await recentSetHandler({ itemType: RECENT_TYPE.DASHBOARD, workspaceId, itemId: dashboardId }, queryClient);
        }
    }

    /* ClOUD SERVICE */
    if (to.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME) {
        const provider = to?.params?.provider;
        const group = to?.params?.group;
        const name = to?.params?.name;
        if (!provider || !group || !name) return;
        await recentSetHandler({ itemType: RECENT_TYPE.CLOUD_SERVICE_TYPE, workspaceId, itemId: `${provider}.${group}.${name}` }, queryClient);
    }

    /* SECURITY */
    if (to.name === ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME) {
        const provider = to?.params?.provider;
        const group = to?.params?.group;
        const name = to?.params?.name;
        if (!provider || !group || !name) return;
        await recentSetHandler({ itemType: RECENT_TYPE.SECURITY, workspaceId, itemId: `${provider}.${group}.${name}` }, queryClient);
    }

    /* PROJECT GROUP */
    if (to.name === PROJECT_ROUTE_V1._NAME) {
        const projectGroupId = to?.params?.projectGroupId;
        if (projectGroupId?.length) {
            await recentSetHandler({ itemType: RECENT_TYPE.PROJECT_GROUP, workspaceId, itemId: projectGroupId as string }, queryClient);
        }
    }

    /* PROJECT */
    if (to.name === PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME) {
        const projectId = to?.params?.id;
        if (!projectId) return;
        await recentSetHandler({ itemType: RECENT_TYPE.PROJECT, workspaceId, itemId: projectId }, queryClient);
    }

    /* SERVICE ACCOUNT */
    if (to.name === SERVICE_ACCOUNT_ROUTE.DETAIL._NAME) {
        const serviceAccountId = to?.params?.serviceAccountId;
        const isTrustedAccount = serviceAccountId.startsWith('ta');
        if (!serviceAccountId) return;
        await recentSetHandler({ itemType: isTrustedAccount ? RECENT_TYPE.TRUSTED_ACCOUNT : RECENT_TYPE.SERVICE_ACCOUNT, workspaceId, itemId: serviceAccountId }, queryClient);
    }

    /* COST ANALYSIS */
    if (to.name === COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME) {
        const dataSourceId = to?.params?.dataSourceId;
        const costQuerySetId = to?.params?.costQuerySetId;
        if (!dataSourceId || !costQuerySetId) return;
        if (MANAGED_COST_QUERY_SET_ID_LIST.includes(costQuerySetId)) {
            await recentSetHandler({ itemType: RECENT_TYPE.COST_ANALYSIS, workspaceId, itemId: getCompoundKeyWithManagedCostQuerySetFavoriteKey(dataSourceId, costQuerySetId) }, queryClient);
        }
        await recentSetHandler({ itemType: RECENT_TYPE.COST_ANALYSIS, workspaceId, itemId: costQuerySetId }, queryClient);
    }

    // if (to.name === ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME) {
    //     const metricId = to?.params?.metricId;
    //     if (!metricId) return undefined;
    //     return { itemType: RECENT_TYPE.METRIC_EXPLORER, workspaceId, itemId: metricId };
    // }

    /* MENU */
    const menu = to.meta?.menuId && MENU_INFO_MAP[to.meta?.menuId as MenuId];
    if (menu) {
        await recentSetHandler({ itemType: RECENT_TYPE.SERVICE, workspaceId, itemId: to.meta?.menuId as MenuId }, queryClient);
    }
};
