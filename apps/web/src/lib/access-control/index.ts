import type { Route } from 'vue-router';

import { clone } from 'lodash';

import type { AccessLevel, PagePermissionTuple, PagePermissionType } from '@/lib/access-control/config';
import { ACCESS_LEVEL, PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import { flattenMenu, getPermissionOfPage } from '@/lib/access-control/page-permission-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

const getAccessTypeFromPermission = (permission?: string | PagePermissionType): AccessLevel => {
    if (permission === PAGE_PERMISSION_TYPE.VIEW) return ACCESS_LEVEL.VIEW_PERMISSION;
    if (permission === PAGE_PERMISSION_TYPE.MANAGE) return ACCESS_LEVEL.MANAGE_PERMISSION;
    return ACCESS_LEVEL.AUTHENTICATED;
};

export const getRouteAccessLevel = (route: Route): AccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return ACCESS_LEVEL.AUTHENTICATED;
    return closestRoute.meta.accessLevel ?? ACCESS_LEVEL.AUTHENTICATED;
};

// extract higher permission from userPagePermissions that exist in referenceMenuIds.
const getPermissionByReferenceMenuIds = (referenceMenuIds: MenuId[], pagePermissions: PagePermissionTuple[]): PagePermissionType|undefined => {
    let result;
    referenceMenuIds.forEach((menuId) => {
        if (result === PAGE_PERMISSION_TYPE.MANAGE) return;
        const permission = pagePermissions.find(([id]) => id === menuId);
        if (permission) result = permission[1];
    });
    return result;
};

export const getUserAccessLevel = (
    route?: Route|null,
    isDomainAdmin?: boolean,
    pagePermissions: PagePermissionTuple[] = [],
    isTokenAlive = true,
): AccessLevel => {
    if (!isTokenAlive) return ACCESS_LEVEL.EXCLUDE_AUTH;
    if (isDomainAdmin) return ACCESS_LEVEL.ADMIN_PERMISSION;

    let permission;

    const referenceMenuIds = route?.meta?.referenceMenuIds ?? [];
    if (referenceMenuIds.length) {
        permission = getPermissionByReferenceMenuIds(referenceMenuIds, pagePermissions);
    } else {
        const menuId = route?.meta?.menuId;
        if (!menuId) return ACCESS_LEVEL.AUTHENTICATED;
        permission = getPermissionOfPage(menuId, pagePermissions, MENU_LIST);
    }

    return getAccessTypeFromPermission(permission);
};
const getMenuAccessLevel = (id: MenuId): AccessLevel => {
    const flattenedMenuList = flattenMenu(MENU_LIST);
    if (!flattenedMenuList.find((menu) => menu.id === id)) return ACCESS_LEVEL.VIEW_PERMISSION;
    return ACCESS_LEVEL.AUTHENTICATED;
};

export const isUserAccessibleToMenu = (menuId: MenuId, pagePermissions: PagePermissionTuple[]): boolean => {
    const [, permission] = pagePermissions.find(([id]) => id === menuId) ?? [];
    if (!permission) return false;
    return getAccessTypeFromPermission(permission) >= getMenuAccessLevel(menuId);
};
export const isUserAccessibleToRoute = (route: Route, isDomainAdmin: boolean, pagePermissions: PagePermissionTuple[]): boolean => {
    const routeAccessLevel = getRouteAccessLevel(route);
    const userAccessLevel = getUserAccessLevel(route, isDomainAdmin, pagePermissions);
    return userAccessLevel >= routeAccessLevel;
};
