import type { Route } from 'vue-router';

import { clone } from 'lodash';

import type { AccessLevel } from '@/lib/access-control/config';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { flattenMenu } from '@/lib/access-control/page-access-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

const getAccessTypeFromPermission = (isAccessible?: boolean): AccessLevel => {
    if (isAccessible) return ACCESS_LEVEL.WORKSPACE_PERMISSION;
    return ACCESS_LEVEL.AUTHENTICATED;
};

export const calculateIsAccessibleRoute = (route: Route, pagePermissions: MenuId[]): boolean => {
    const closetMenuRoute = clone(route?.matched)?.reverse().find((match) => !!match.meta.menuId);
    const menuId = closetMenuRoute?.meta.menuId;
    return pagePermissions.some((id) => id === menuId);
};

const getMenuAccessLevel = (id: MenuId): AccessLevel => {
    const flattenedMenuList = flattenMenu(MENU_LIST);
    if (!flattenedMenuList.find((menu) => menu.id === id)) return ACCESS_LEVEL.WORKSPACE_PERMISSION;
    return ACCESS_LEVEL.AUTHENTICATED;
};

export const isUserAccessibleToMenu = (menuId: MenuId, pageAccessList: MenuId[]): boolean => {
    const isAccessible = pageAccessList.some((id) => id === menuId);
    if (!isAccessible) return false;
    return getAccessTypeFromPermission(isAccessible) >= getMenuAccessLevel(menuId);
};
