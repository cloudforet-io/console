import type { Route } from 'vue-router';
import type { Location } from 'vue-router/types/router';

import { ERROR_ROUTE } from '@/router/constant';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type { FlattenedMenuMap } from '@/store/menu/menu-store';
import { useMenuStore } from '@/store/menu/menu-store';
import { pinia } from '@/store/pinia';

import type { MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

const _getSubMenuListByMenuId = (menuId: MenuId, flattenedMenu: FlattenedMenuMap): MenuId[] => {
    if (flattenedMenu[menuId]) return flattenedMenu[menuId] || [];
    return [];
};

export const getRedirectRouteByPagePermission = (route: Route): Location => {
    const menuId = route.meta?.menuId;
    if (!menuId) return { name: ERROR_ROUTE._NAME, params: { statusCode: '404' } };

    const menuStore = useMenuStore(pinia);
    const authorizationStore = useAuthorizationStore(pinia);

    const subMenuIdList = _getSubMenuListByMenuId(menuId, menuStore.getters.generateFlattenedMenuMap);
    let redirectMenuId: MenuId|undefined;
    subMenuIdList.some((subMenuId) => {
        if (authorizationStore.getters.pageAccessPermissionMap[subMenuId]) {
            redirectMenuId = subMenuId;
            return true;
        }
        return false;
    });

    if (redirectMenuId) return { name: MENU_INFO_MAP[redirectMenuId].routeName };
    return { name: ERROR_ROUTE._NAME, params: { statusCode: '403' } };
};
