import { Route } from 'vue-router';
import { clone } from 'lodash';
import { PagePermissionTuple, PagePermissionType } from '@/lib/access-control/page-permission-helper';

export enum ROUTE_ACCESS_LEVEL {
    EXCLUDE_AUTH = 0,
    AUTHENTICATED = 1,
    VIEW_PERMISSION = 2,
    MANAGE_PERMISSION = 3,
}

export type RouteAccessType = keyof typeof ROUTE_ACCESS_LEVEL
export type RouteAccessLevel = typeof ROUTE_ACCESS_LEVEL[RouteAccessType]

const getAccessTypeFromPermission = (permission?: string | PagePermissionType): RouteAccessType => {
    if (permission === 'VIEW') return 'VIEW_PERMISSION';
    if (permission === 'MANAGE') return 'MANAGE_PERMISSION';
    return 'AUTHENTICATED';
};

export const getRouteAccessLevel = (route: Route): RouteAccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(d => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return ROUTE_ACCESS_LEVEL.AUTHENTICATED;
    return closestRoute.meta.accessLevel;
};

export const getUserAccessLevelToRoute = (route: Route, pagePermissions: PagePermissionTuple[] = [], isTokenAlive = true) => {
    if (!isTokenAlive) return ROUTE_ACCESS_LEVEL.EXCLUDE_AUTH;
    const [, permission] = pagePermissions.find(([id]) => route.matched.find(r => r.name === id)) ?? [];
    return ROUTE_ACCESS_LEVEL[getAccessTypeFromPermission(permission)];
};
