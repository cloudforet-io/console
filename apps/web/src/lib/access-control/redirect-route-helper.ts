import type { Route } from 'vue-router';
import type { Location } from 'vue-router/types/router';

import { ERROR_ROUTE } from '@/router/constant';

import { useGlobalConfigSchemaStore, type FlattenedMenuMap } from '@/store/global-config-schema/global-config-schema-store';

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

    const globalConfigSchemaStore = useGlobalConfigSchemaStore();
    const generateFlattenedMenuMap = globalConfigSchemaStore.getters.generateFlattenedMenuMap;
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
