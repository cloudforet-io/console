import type { Route } from 'vue-router';

import type { RecentConfig } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

import { getCompoundKeyWithManagedCostQuerySetFavoriteKey } from '@/lib/helper/config-data-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { MANAGED_COST_QUERY_SET_ID_LIST } from '@/services/cost-explorer/cost-analysis/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';

export const getRecentConfig = (to: Route): RecentConfig | undefined => {
    /* DASHBOARD */
    if (to.name === DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME || to.name === DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME) {
        const dashboardId = to?.params?.dashboardId;
        if (!dashboardId) return undefined;
        return { itemType: RECENT_TYPE.DASHBOARD, itemId: dashboardId };
    }
    /* ClOUD SERVICE */
    if (to.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME) {
        const provider = to?.params?.provider;
        const group = to?.params?.group;
        const name = to?.params?.name;
        if (!provider || !group || !name) return undefined;
        return { itemType: RECENT_TYPE.CLOUD_SERVICE, itemId: `${provider}.${group}.${name}` };
    }

    /* PROJECT GROUP */
    if (to.name === PROJECT_ROUTE._NAME) {
        const projectGroupId = to?.query?.select_pg;
        if (projectGroupId?.length) {
            return { itemType: RECENT_TYPE.PROJECT_GROUP, itemId: projectGroupId as string };
        }
    }

    /* PROJECT */
    if (to.name === PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME) {
        const projectId = to?.params?.id;
        if (!projectId) return undefined;
        return { itemType: RECENT_TYPE.PROJECT, itemId: projectId };
    }

    if (to.name === COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME) {
        const dataSourceId = to?.params?.dataSourceId;
        const costQuerySetId = to?.params?.costQuerySetId;
        if (!dataSourceId || !costQuerySetId) return undefined;
        if (MANAGED_COST_QUERY_SET_ID_LIST.includes(costQuerySetId)) {
            return { itemType: RECENT_TYPE.COST_ANALYSIS, itemId: getCompoundKeyWithManagedCostQuerySetFavoriteKey(dataSourceId, costQuerySetId) };
        }
        return { itemType: RECENT_TYPE.COST_ANALYSIS, itemId: costQuerySetId };
    }

    /* MENU */
    const menu = MENU_INFO_MAP[to.name as MenuId];
    if (menu) {
        return { itemType: RECENT_TYPE.MENU, itemId: to.name as MenuId };
    }
    return undefined;
};
