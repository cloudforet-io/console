import type { Location } from 'vue-router/types/router';

import { ERROR_ROUTE } from '@/router/error-routes';

import type { PagePermissionType } from '@/lib/access-control/config';
import type { Menu, MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

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

export const getRedirectRouteByPagePermission = (menuId: MenuId, pagePermissionsMap: Record<string, PagePermissionType>): Location => {
    const subMenuIdList = getSubMenuListByMenuId(menuId);
    let redirectMenuId: MenuId|undefined;
    subMenuIdList.some((subMenuId) => {
        if (pagePermissionsMap[subMenuId]) {
            redirectMenuId = subMenuId;
            return true;
        }
        return false;
    });
    if (redirectMenuId) return { name: redirectMenuId };
    return { name: ERROR_ROUTE._NAME, params: { statusCode: '403' } };
};

export const gerRedirectRouteByURL = () => {
    console.log(window.location);
};
