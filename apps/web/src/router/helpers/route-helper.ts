import type { Route } from 'vue-router';

import { ROUTE_SCOPE } from '@/router/constant';
import type { RouteScopeType } from '@/router/type';

export const makeAdminRouteName = (routeName: string): string => {
    if (routeName.startsWith('admin.')) return routeName;
    return `admin.${routeName}`;
};


export const getRouteScope = (route: Route): RouteScopeType => {
    const routeScope = route.matched[1].meta?.scope;
    if (!routeScope) return ROUTE_SCOPE.EXCLUDE_AUTH;
    return routeScope;
};
