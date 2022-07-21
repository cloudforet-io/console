import type { Location } from 'vue-router/types/router';

import { ERROR_ROUTE } from '@/router/error-routes';

import type { PagePermissionType } from '@/lib/access-control/page-permission-helper';
import type { Menu, MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

const getFlattenedSubMenuIds = (menu: Menu, flattenedMenuIds: MenuId[] = []): MenuId[] => {
    if (!menu.subMenuList) return flattenedMenuIds;
    let results = [...flattenedMenuIds];
    menu.subMenuList.forEach((lnb) => {
        results.push(lnb.id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        results = results.concat(getFlattenedSubMenuIds(lnb, results));
    });
    return results;
};

const PARENT_CHILDREN_MENU_IDS: [MenuId, MenuId[]][] = MENU_LIST.map(menu => [menu.id, getFlattenedSubMenuIds(menu)]);

const getSubMenuListByMenuId = (menuId: MenuId): MenuId[] => {
    let subMenuIds: MenuId[] = [];
    PARENT_CHILDREN_MENU_IDS.some(([parentId, childIds]) => {
        // All menu ids are dot-delimited in depth, up to two depths.
        if (parentId === menuId || menuId.startsWith(`${parentId}.`)) {
            subMenuIds = childIds;
            return true;
        }

        return false;
    });
    return subMenuIds;
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
    return { name: redirectMenuId ?? ERROR_ROUTE._NAME };
};
