import type { Route } from 'vue-router';

import { clone } from 'lodash';

import type { AccessLevel } from '@/lib/access-control/config';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { flattenMenu, getAccessPermissionOfMenu } from '@/lib/access-control/page-access-permission-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

const getAccessTypeFromPermission = (isAccessible?: boolean): AccessLevel => {
    if (isAccessible) return ACCESS_LEVEL.WORKSPACE_PERMISSION;
    return ACCESS_LEVEL.AUTHENTICATED;
};

export const getRouteAccessLevel = (route: Route): AccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return ACCESS_LEVEL.AUTHENTICATED;
    return closestRoute.meta.accessLevel ?? ACCESS_LEVEL.AUTHENTICATED;
};

// extract higher permission from userPagePermissions that exist in referenceMenuIds.
const getIsAccessibleByReferenceMenuIds = (referenceMenuIds: MenuId[], pagePermissions: MenuId[]): boolean => {
    let result = false;
    referenceMenuIds.forEach((menuId) => {
        if (result) return;
        const permission = pagePermissions.find(([id]) => id === menuId);
        if (permission) result = true;
    });
    return result;
};

export const getUserAccessLevel = (
    route?: Route|null,
    isDomainAdmin?: boolean,
    pagePermissions: MenuId[] = [],
    isTokenAlive = true,
): AccessLevel => {
    if (!isTokenAlive) return ACCESS_LEVEL.EXCLUDE_AUTH;
    if (isDomainAdmin) return ACCESS_LEVEL.ADMIN_PERMISSION;

    let isAccessible: boolean;

    const referenceMenuIds = route?.meta?.referenceMenuIds ?? [];
    if (referenceMenuIds.length) {
        isAccessible = getIsAccessibleByReferenceMenuIds(referenceMenuIds, pagePermissions);
    } else {
        const menuId = route?.meta?.menuId;
        if (!menuId) return ACCESS_LEVEL.AUTHENTICATED;
        isAccessible = getAccessPermissionOfMenu(menuId, pagePermissions);
    }

    return getAccessTypeFromPermission(isAccessible);
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
export const isUserAccessibleToRoute = (route: Route, isDomainAdmin: boolean, pagePermissions: MenuId[]): boolean => {
    const routeAccessLevel = getRouteAccessLevel(route);
    const userAccessLevel = getUserAccessLevel(route, isDomainAdmin, pagePermissions);
    return userAccessLevel >= routeAccessLevel;
};
