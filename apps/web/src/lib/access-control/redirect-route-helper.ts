import type { Route } from 'vue-router';
import type { Location } from 'vue-router/types/router';

import { ERROR_ROUTE } from '@/router/constant';

import type { FlattenedMenuMap } from '@/store/menu/menu-store';
import { useMenuStore } from '@/store/menu/menu-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

const getSubMenuListByMenuId = (menuId: MenuId, flattenedMenu: FlattenedMenuMap): MenuId[] => {
    if (flattenedMenu[menuId]) return flattenedMenu[menuId] || [];
    return [];
};

export const getRedirectRouteByPagePermission = (route: Route, pagePermissionsMap: PageAccessMap): Location => {
    const menuId = route.meta?.menuId;
    if (!menuId) return { name: ERROR_ROUTE._NAME, params: { statusCode: '404' } };

    const menuStore = useMenuStore();
    const generateFlattenedMenuMap = menuStore.getters.generateFlattenedMenuMap;
    const subMenuIdList = getSubMenuListByMenuId(menuId, generateFlattenedMenuMap);
    let redirectMenuId: MenuId|undefined;
    subMenuIdList.some((subMenuId) => {
        if (pagePermissionsMap[subMenuId]) {
            redirectMenuId = subMenuId;
            return true;
        }
        return false;
    });

    if (redirectMenuId) return { name: MENU_INFO_MAP[redirectMenuId].routeName };
    return { name: ERROR_ROUTE._NAME, params: { statusCode: '403' } };
};
