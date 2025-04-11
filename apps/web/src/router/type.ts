import type { ROUTE_SCOPE } from '@/router/constant';

export type RouteScopeType = keyof typeof ROUTE_SCOPE;

export interface RouteParams {
    menuId: string;
    name?: string;
    route?: any;
    params?: Record<string, string>;
    query?: Record<string, string | string[]>;
}


