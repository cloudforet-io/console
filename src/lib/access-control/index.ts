import { Route } from 'vue-router';
import { clone } from 'lodash';
import { PagePermissionTuple, PagePermissionType } from '@/lib/access-control/page-permission-helper';

export enum PAGE_ACCESS_LEVEL {
    EXCLUDE_AUTH = 0,
    REQUIRED_AUTH = 1,
    VIEW_PERMISSION = 2,
    MANAGE_PERMISSION = 3,
}

export type PageAccessType = keyof typeof PAGE_ACCESS_LEVEL
export type PageAccessLevel = typeof PAGE_ACCESS_LEVEL[PageAccessType]

const getProperPageAccessType = (permission?: string | PagePermissionType): PageAccessType => {
    if (permission === 'VIEW') return 'VIEW_PERMISSION';
    if (permission === 'MANAGE') return 'MANAGE_PERMISSION';
    return 'EXCLUDE_AUTH';
};

export const isRouteAccessible = (route: Route, pagePermissions: PagePermissionTuple[] = []): boolean => {
    const routeName = route.name;
    if (!routeName) return false;

    // find route access level
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(d => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return false;
    const routeAccessLevel = closestRoute.meta.accessLevel;

    // find user's page access level by page permissions
    const [, permission] = pagePermissions.find(([page]) => routeName.startsWith(page)) ?? [];
    const userAccessLevel = PAGE_ACCESS_LEVEL[getProperPageAccessType(permission)];

    return userAccessLevel >= routeAccessLevel;
};

export const getRouteAccessLevel = (route: Route): PageAccessLevel => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(d => d.meta?.accessLevel !== undefined);
    if (!closestRoute) return PAGE_ACCESS_LEVEL.EXCLUDE_AUTH;
    return closestRoute.meta.accessLevel;
};
