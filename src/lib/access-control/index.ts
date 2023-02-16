import type { Route } from 'vue-router';

import { clone } from 'lodash';

import type { AccessLevel, PagePermissionTuple, PagePermissionType } from '@/lib/access-control/config';
import { ACCESS_LEVEL, PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import { getPermissionOfPage } from '@/lib/access-control/page-permission-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

const getAccessTypeFromPermission = (permission?: string | PagePermissionType): AccessLevel => {
    if (permission === PAGE_PERMISSION_TYPE.VIEW) return ACCESS_LEVEL.VIEW_PERMISSION;
    if (permission === PAGE_PERMISSION_TYPE.MANAGE) return ACCESS_LEVEL.MANAGE_PERMISSION;
    return ACCESS_LEVEL.AUTHENTICATED;
};
const getMenuIdByRouteName = (routeName?: string|null): MenuId|undefined => {
    if (!routeName) return undefined;

    if (MENU_INFO_MAP[routeName]) return routeName as MenuId;

    let name = routeName;
    const hasMenuId = routeName.split('.').reverse().some((d) => {
        name = name.slice(0, name.length - d.length - 1);
        return MENU_INFO_MAP[name];
    });
    return hasMenuId ? name as MenuId : undefined;
};

export const getRouteAccessLevel = (route: Route): AccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return ACCESS_LEVEL.AUTHENTICATED;
    return closestRoute.meta.accessLevel ?? ACCESS_LEVEL.AUTHENTICATED;
};

export const getUserAccessLevel = (routeName?: string|null, pagePermissions: PagePermissionTuple[] = [], isTokenAlive = true, referenceRouteNames?: string[]|undefined): AccessLevel => {
    if (!isTokenAlive) return ACCESS_LEVEL.EXCLUDE_AUTH;

    const menuId = getMenuIdByRouteName(routeName);
    if (!menuId) return ACCESS_LEVEL.AUTHENTICATED;

    const permission = getPermissionOfPage(menuId, pagePermissions, referenceRouteNames);
    return getAccessTypeFromPermission(permission);
};
const getMenuAccessLevel = (id: MenuId): AccessLevel => (MENU_INFO_MAP[id]?.needPermissionByRole ? ACCESS_LEVEL.VIEW_PERMISSION : ACCESS_LEVEL.AUTHENTICATED);

export const isUserAccessibleToMenu = (menuId: MenuId, pagePermissions: PagePermissionTuple[]): boolean => {
    const [, permission] = pagePermissions.find(([id]) => id === menuId) ?? [];
    if (!permission) return false;
    return getAccessTypeFromPermission(permission) >= getMenuAccessLevel(menuId);
};
export const isUserAccessibleToRoute = (route: Route, pagePermissions: PagePermissionTuple[]): boolean => {
    const routeAccessLevel = getRouteAccessLevel(route);
    const userAccessLevel = getUserAccessLevel(route.name, pagePermissions);
    return userAccessLevel >= routeAccessLevel;
};
