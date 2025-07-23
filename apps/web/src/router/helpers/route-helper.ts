import type { Route, NavigationGuardNext } from 'vue-router';

import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { clone } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import {
    ERROR_ROUTE, EXTERNAL_PAGES, ROOT_ROUTE, ROUTE_SCOPE,
} from '@/router/constant';
import type { RouteScopeType } from '@/router/types';

import type { MenuId } from '@/lib/menu/config';
import { getLastAccessedWorkspaceId, setCurrentAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { ADMIN_WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/admin/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';


const _getValidWorkspaceId = (workspaceId: string|undefined, workspaceList: WorkspaceModel[]): string|undefined => workspaceList.find((w) => w.workspace_id === workspaceId)?.workspace_id;

const _calculateIsAccessibleRoute = (route: Route, pagePermissions: MenuId[]): boolean => {
    const closetMenuRoute = clone(route?.matched)?.reverse().find((match) => !!match.meta.menuId);
    const menuId = closetMenuRoute?.meta.menuId;
    return pagePermissions.some((id) => id === menuId);
};


export const makeAdminRouteName = (routeName: string): string => {
    if (routeName.startsWith('admin.')) return routeName;
    return `admin.${routeName}`;
};


export const getRouteScope = (route: Route): RouteScopeType => {
    const routeScope = route.matched[1]?.meta?.scope;
    if (!routeScope) return ROUTE_SCOPE.EXCLUDE_AUTH;
    return routeScope;
};


export const getCurrentTime = (): number => Math.floor(Date.now() / 1000);

export const getDecodedDataFromAccessToken = (): {rol: string, wid: string} => {
    try {
        const accessToken = SpaceConnector.getAccessToken() as string;
        if (!accessToken) {
            return { rol: '', wid: '' };
        }
        const { rol, wid } = jwtDecode<JwtPayload&{rol: string, wid: string}>(accessToken);
        return { rol, wid };
    } catch (e) {
        console.error(e);
        return { rol: '', wid: '' };
    }
};


// Router BeforeEach Guard - Route-Validation-and-Verification Process
export const processTokenVerification = (to: Route, next: NavigationGuardNext, routeScope: RouteScopeType): boolean => {
    const isTokenAlive = SpaceConnector.isTokenAlive;

    if (!isTokenAlive) {
        if (routeScope === ROUTE_SCOPE.EXCLUDE_AUTH) {
            next();
            return false;
        }
        next({
            name: AUTH_ROUTE.SIGN_OUT._NAME,
            query: { previousPath: to.fullPath },
        });
        return false;
    }

    const ROOT_REDIRECT_SKIP_ROUTE_NAMES = [
        AUTH_ROUTE.SIGN_OUT._NAME,
        ERROR_ROUTE._NAME,
        AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME,
        AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH_SETUP._NAME,
        ERROR_ROUTE.EXPIRED_LINK._NAME,
        ...EXTERNAL_PAGES,
    ];

    if (!ROOT_REDIRECT_SKIP_ROUTE_NAMES.includes(to.name as string) && routeScope === ROUTE_SCOPE.EXCLUDE_AUTH) {
        next({ name: ROOT_ROUTE._NAME });
        return false;
    }

    return true;
};
export const processRouteIntegrityCheck = (to: Route, next: NavigationGuardNext): boolean => {
    const OLD_PATHS = [/^\/home-dashboard(?:\/(?=$))?$/i, /^\/dashboard(?:\/(?=$))?$/i, /^\/home(?:\/(?=$))?$/i];
    const { rol: prevRole } = getDecodedDataFromAccessToken();

    // Abnormal Route Check
    const isDirectAccessToOldPath = !to.name && OLD_PATHS.some((path) => path.test(to.path));
    const isNonePathRoute = !!to?.name && to?.path === '/';

    if (isDirectAccessToOldPath) {
        next({ name: ROOT_ROUTE._NAME });
        return false;
    }
    if (isNonePathRoute) {
        if (prevRole === 'DOMAIN_ADMIN') {
            next({ name: ADMIN_WORKSPACE_HOME_ROUTE._NAME });
            return false;
        }

        next({
            name: ERROR_ROUTE._NAME, params: { statusCode: '404' },
        });
        return false;
    }

    return true;
};
export const processWorkspaceAccessValidation = async (to: Route, next: NavigationGuardNext, workspaceList: WorkspaceModel[]): Promise<boolean> => {
    const { wid: prevWorkspaceId } = getDecodedDataFromAccessToken();

    if (!workspaceList.length) {
        next({ name: LANDING_ROUTE._NAME });
        return false;
    }

    const targetWorkspaceId = to.params.workspaceId;
    if (!targetWorkspaceId) {
        let lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();
        if (!_getValidWorkspaceId(lastAccessedWorkspaceId, workspaceList)) {
            await setCurrentAccessedWorkspaceId(undefined);
            lastAccessedWorkspaceId = undefined;
        }
        next({
            ...to,
            name: to.name as string,
            params: {
                ...to.params,
                workspaceId: prevWorkspaceId || lastAccessedWorkspaceId || workspaceList[0].workspace_id,
            },
            query: to.query,
        });
        return false;
    }

    if (!_getValidWorkspaceId(targetWorkspaceId, workspaceList)) {
        next({
            name: ERROR_ROUTE._NAME, params: { statusCode: '404' },
        });
        return false;
    }

    return true;
};

// Grant Scope Process
export const shouldUpdateScope = (prevRole: string, routeScope: RouteScopeType, prevWorkspaceId: string, targetWorkspaceId: string): boolean => {
    const isScopeChanged = !prevRole || !prevRole.startsWith(routeScope);
    const isWorkspaceChanged = routeScope === 'WORKSPACE' && prevRole.startsWith(routeScope) && prevWorkspaceId !== targetWorkspaceId;
    return isScopeChanged || isWorkspaceChanged;
};
export const verifyPageAccessAndRedirect = (to: Route, next: NavigationGuardNext, workspaceId: string, pageAccessPermissionList: MenuId[]): void => {
    const isAccessibleRoute = _calculateIsAccessibleRoute(to, pageAccessPermissionList);
    if (isAccessibleRoute) {
        next({
            ...to,
            name: to.name as string,
            params: {
                ...to.params,
                workspaceId,
            },
            query: to.query,
        });
    } else {
        next({
            name: WORKSPACE_HOME_ROUTE._NAME,
            params: { workspaceId },
        });
    }
};
