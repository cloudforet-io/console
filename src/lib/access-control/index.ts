/* eslint-disable import/no-cycle */
import { Route } from 'vue-router';
import { clone } from 'lodash';
import { PagePermissionTuple, PagePermissionType } from '@/lib/access-control/page-permission-helper';
import { MENU_ID, MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { AccessLevel, ACCESS_LEVEL } from '@/lib/access-control/config';

const getAccessTypeFromPermission = (permission?: string | PagePermissionType): AccessLevel => {
    if (permission === 'VIEW') return 'VIEW_PERMISSION';
    if (permission === 'MANAGE') return 'MANAGE_PERMISSION';
    return 'AUTHENTICATED';
};

const menuIdList = Object.values(MENU_ID);
const getMenuIdByRouteName = (routeName?: string|null): MenuId|undefined => {
    if (!routeName) return undefined;

    const isSubMenu = routeName.includes('.');
    return menuIdList.find((id) => {
        if (id === routeName) return true;
        if (isSubMenu && !id.includes('.')) return false;
        return routeName.startsWith(`${id}.`);
    });
};

export const getRouteAccessLevel = (route: Route): AccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(d => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return 'AUTHENTICATED';
    return closestRoute.meta.accessLevel ?? 'AUTHENTICATED';
};

export const getUserAccessLevel = (routeName?: string|null, pagePermissions: PagePermissionTuple[] = [], isTokenAlive = true): AccessLevel => {
    if (!isTokenAlive) return 'EXCLUDE_AUTH';

    const menuId = getMenuIdByRouteName(routeName);
    if (!menuId) return 'AUTHENTICATED';

    const [, permission] = pagePermissions.find(([id]) => id === menuId) ?? [];
    return getAccessTypeFromPermission(permission);
};

export const getMenuAccessLevel = (id: MenuId): AccessLevel => MENU_INFO_MAP[id]?.accessLevel ?? 'AUTHENTICATED';

export const isUserAccessibleToMenu = (menuId: MenuId, pagePermissions: PagePermissionTuple[] = []): boolean => {
    const [, permission] = pagePermissions.find(([id]) => id === menuId) ?? [];
    return ACCESS_LEVEL[getAccessTypeFromPermission(permission)] >= ACCESS_LEVEL[getMenuAccessLevel(menuId)];
};

export const isRouteAccessible = (route: Route, accessLevel: AccessLevel): boolean => {
    const routeAccessLevel = getRouteAccessLevel(route);
    return ACCESS_LEVEL[routeAccessLevel] >= ACCESS_LEVEL[accessLevel];
};
