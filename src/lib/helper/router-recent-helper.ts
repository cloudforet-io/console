import { RECENT_TYPE, RecentConfig } from '@/store/modules/recent/type';
import { Route } from 'vue-router';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

export const getRecentConfig = (to: Route): RecentConfig | undefined => {
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
        if (!projectGroupId) return undefined;
        return { itemType: RECENT_TYPE.PROJECT_GROUP, itemId: projectGroupId as string };
    }

    /* PROJECT */
    if (to.name === PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME) {
        const projectId = to?.params?.id;
        if (!projectId) return undefined;
        return { itemType: RECENT_TYPE.PROJECT, itemId: projectId };
    }

    /* MENU */
    const menu = Object.entries(MENU_INFO_MAP).find(([, v]) => v.to.name === to.name);
    if (menu) {
        return { itemType: RECENT_TYPE.MENU, itemId: menu[0] };
    }
    return undefined;
};
