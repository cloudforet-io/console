import { Route } from 'vue-router';
import { clone } from 'lodash';
import { PagePermissionTuple, PagePermissionType } from '@/lib/access-control/page-permission-helper';

export enum ROUTE_ACCESS_LEVEL {
    EXCLUDE_AUTH = 0,
    REQUIRED_AUTH = 1,
    VIEW_PERMISSION = 2,
    MANAGE_PERMISSION = 3,
}

export type RouteAccessType = keyof typeof ROUTE_ACCESS_LEVEL
export type RouteAccessLevel = typeof ROUTE_ACCESS_LEVEL[RouteAccessType]

const getProperRouteAccessType = (permission?: string | PagePermissionType): RouteAccessType => {
    if (permission === 'VIEW') return 'VIEW_PERMISSION';
    if (permission === 'MANAGE') return 'MANAGE_PERMISSION';
    return 'REQUIRED_AUTH';
};

export const isRouteAccessible = (route: Route, menuPermissions: PagePermissionTuple[] = []): boolean => {
    const routeName = route.name;
    if (!routeName) return false;

    // find route access level
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(d => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return false;
    const routeAccessLevel = closestRoute.meta.accessLevel;

    // find user's access level by page permissions
    const [, permission] = menuPermissions.find(([menuId]) => routeName.startsWith(menuId)) ?? [];
    const userAccessLevel = ROUTE_ACCESS_LEVEL[getProperRouteAccessType(permission)];

    return userAccessLevel >= routeAccessLevel;
};

export const getRouteAccessLevel = (route: Route): RouteAccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(d => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return ROUTE_ACCESS_LEVEL.EXCLUDE_AUTH;
    return closestRoute.meta.accessLevel;
};

export const hasFullAccessLevelToRoute = (route: Route, menuPermissions: PagePermissionTuple[] = []): boolean => {
    const routeName = route.name;
    if (!routeName) return false;

    // find user's access level by page permissions
    const [, permission] = menuPermissions.find(([menuId]) => routeName.startsWith(menuId)) ?? [];
    const userAccessLevel = ROUTE_ACCESS_LEVEL[getProperRouteAccessType(permission)];

    return userAccessLevel >= ROUTE_ACCESS_LEVEL.MANAGE_PERMISSION;
};
