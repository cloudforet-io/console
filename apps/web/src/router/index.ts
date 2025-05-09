import Vue from 'vue';
import type { NavigationGuardNext, Route, RouteConfig } from 'vue-router';
import VueRouter from 'vue-router';

import { clone } from 'lodash';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { TokenGrantParameters } from '@/api-clients/identity/token/schema/api-verbs/grant';
import type { GrantScope } from '@/api-clients/identity/token/schema/type';

import { ERROR_ROUTE, ROUTE_SCOPE } from '@/router/constant';
import {
    getCurrentTime,
    getDecodedDataFromAccessToken,
    getRouteScope, shouldUpdateScope,
    processRouteIntegrityCheck,
    processTokenVerification,
    processWorkspaceAccessValidation, verifyPageAccessAndRedirect,
} from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { pinia } from '@/store/pinia';

import { getRecentConfig } from '@/lib/helper/router-recent-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { GTag } from '@/lib/site-analytics/gtag';


const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'SpaceRouter/ChunkLoadFailRefreshed';
const grantAndLoadByCurrentScope = async (
    scope: GrantScope,
    afterGrantedCallback: () => void,
    authorizationStore: ReturnType<typeof useAuthorizationStore>,
    workspaceId?: string,
): Promise<{ failStatus: boolean }> => {
    const refreshToken = SpaceConnector.getRefreshToken();
    const grantRequest: Omit<TokenGrantParameters, 'grant_type'> = {
        scope,
        token: refreshToken as string,
        workspace_id: workspaceId,
    };

    const isGranted: boolean = await authorizationStore.grantRole(grantRequest);
    if (isGranted) {
        afterGrantedCallback();
    }
    return {
        failStatus: !!authorizationStore.state.grantAccessFailStatus,
    };
};
export class SpaceRouter {
    static router: VueRouter;

    static init(
        routes: RouteConfig[],
        afterGrantedCallback: () => void,
        authorizationStore: ReturnType<typeof useAuthorizationStore>,
    ) {
        if (SpaceRouter.router) throw new Error('Router init failed: Already initiated.');

        Vue.use(VueRouter);

        SpaceRouter.router = new VueRouter({
            mode: 'history',
            linkActiveClass: 'open active',
            routes,
        });

        let previousPath: string;
        const appContextStore = useAppContextStore(pinia);
        const userWorkspaceStore = useUserWorkspaceStore(pinia);

        SpaceRouter.router.onError((error) => {
            console.error(error);

            if (error.name === 'ChunkLoadError') {
                const lastCheckedTime = LocalStorageAccessor.getItem(CHUNK_LOAD_REFRESH_STORAGE_KEY);
                if (!lastCheckedTime) {
                    LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, getCurrentTime().toString());
                    window.location.href = previousPath ?? '/';
                } else if (getCurrentTime() - parseInt(lastCheckedTime) < 10) {
                    window.location.href = previousPath ?? '/';
                }
            }
        });

        SpaceRouter.router.onReady(() => {
            LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, '');
        });

        SpaceRouter.router.beforeEach(async (to, from, next) => {
            /* Redirection to proper route */
            const currentWorkspaceId = userWorkspaceStore.getters.currentWorkspaceId;
            const redirected = SpaceRouter.handleWorkspaceRouteRedirection(to, currentWorkspaceId, next);
            if (redirected) return;

            const { rol: prevRole, wid: prevWorkspaceId } = getDecodedDataFromAccessToken();
            const routeScope = getRouteScope(to);

            /* Route-Validation-and-Verification Process */
            let continueProcess: boolean;
            continueProcess = processTokenVerification(to, next, routeScope);
            if (!continueProcess) return;

            continueProcess = processRouteIntegrityCheck(to, next);
            if (!continueProcess) return;

            if (routeScope === ROUTE_SCOPE.WORKSPACE) {
                continueProcess = await processWorkspaceAccessValidation(to, next, userWorkspaceStore.getters.workspaceList);
                if (!continueProcess) return;
            }

            /* Grant Scope Process */
            if (routeScope !== ROUTE_SCOPE.EXCLUDE_AUTH && shouldUpdateScope(prevRole, routeScope, prevWorkspaceId, to.params.workspaceId)) {
                const { failStatus } = await grantAndLoadByCurrentScope(routeScope, afterGrantedCallback, authorizationStore, to.params.workspaceId);

                if (failStatus) { // Grant fail
                    await userWorkspaceStore.load();
                    next({
                        name: ERROR_ROUTE._NAME,
                        params: { statusCode: '404' },
                    });
                } else if (routeScope === ROUTE_SCOPE.WORKSPACE) { // Grant success - Workspace
                    verifyPageAccessAndRedirect(to, next, to.params.workspaceId, authorizationStore.getters.pageAccessPermissionList);
                } else next(); // Grant success - Others (Admin, User)
            } else { // Grant Process Not Needed
                appContextStore.setGlobalGrantLoading(false);
                next();
                return;
            }

            next();
        });

        SpaceRouter.router.afterEach((to) => {
            // set target page as GTag page view
            if (GTag.gtag) GTag.setPageView(to);
            const isAdminMode = appContextStore.getters.isAdminMode;
            const pageAccessPermissionMap = authorizationStore.getters.pageAccessPermissionMap;
            const routeScope = getRouteScope(to);

            if (!isAdminMode && routeScope === 'WORKSPACE') {
                const reversedMatched = clone(to.matched).reverse();
                const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
                const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;

                if (pageAccessPermissionMap && !pageAccessPermissionMap[targetMenuId]) {
                    SpaceRouter.router.push({ name: 'error', params: { statusCode: '403' } }).catch((e) => {
                        console.error(e);
                    });
                    return;
                }

                const recent = getRecentConfig(to);
                if (recent) {
                    SpaceConnector.clientV2.config.userConfig.set({
                        name: `console:recent:${recent.itemType}:${recent.workspaceId}:${recent.itemId}`,
                        data: {
                            id: recent.itemId,
                            workspace_id: recent.workspaceId,
                            type: recent.itemType,
                            label: recent.itemId,
                        },
                    }).catch((e) => {
                        console.error(e);
                    });
                }
            }
        });

        return SpaceRouter.router;
    }


    static handleWorkspaceRouteRedirection(to: Route, currentWorkspaceId: string|undefined, next: NavigationGuardNext): boolean {
        const targetRouteScope = getRouteScope(to);
        const needsWorkspaceId = targetRouteScope === ROUTE_SCOPE.WORKSPACE && !to.params.workspaceId && currentWorkspaceId;

        if (to.name && needsWorkspaceId) {
            next({
                ...to,
                name: to.name,
                params: {
                    ...to.params,
                    workspaceId: currentWorkspaceId,
                },
            });
            return true;
        }

        return false;
    }
}
