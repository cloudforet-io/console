import type { Route } from 'vue-router';
import type { Location } from 'vue-router/types/router';

import { ERROR_ROUTE } from '@/router/constant';

import type { Menu, MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

type FlattenedMenuMap = Partial<Record<MenuId, MenuId[]>>;
const getSubMenuIdsToMap = (menu: Menu, flattenedMenuMap: FlattenedMenuMap = {}): FlattenedMenuMap => {
    let results: MenuId[] = [];
    const subMenuList = menu.subMenuList;
    if (subMenuList) {
        subMenuList.forEach((subMenu) => {
            results = subMenuList.map((d) => d.id);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getSubMenuIdsToMap(subMenu, flattenedMenuMap);
        });
    }
    flattenedMenuMap[menu.id] = results;
    return flattenedMenuMap;
};

const FLATTENED_MENU_MAP = {};
MENU_LIST.forEach((menu) => {
    getSubMenuIdsToMap(menu, FLATTENED_MENU_MAP);
});

const getSubMenuListByMenuId = (menuId: MenuId): MenuId[] => {
    if (FLATTENED_MENU_MAP[menuId]) return FLATTENED_MENU_MAP[menuId];
    return [];
};

export const getRedirectRouteByPagePermission = (route: Route, pagePermissionsMap: Record<string, boolean>): Location => {
    const menuId = route.meta?.menuId;
    if (!menuId) return { name: ERROR_ROUTE._NAME, params: { statusCode: '404' } };
    const subMenuIdList = getSubMenuListByMenuId(menuId);
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
