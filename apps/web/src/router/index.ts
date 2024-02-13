import Vue from 'vue';
import type { RouteConfig } from 'vue-router';
import VueRouter from 'vue-router';

import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { GrantScope } from '@/schema/identity/token/type';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { ERROR_ROUTE, ROOT_ROUTE } from '@/router/constant';
import { getRouteScope, makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { pinia } from '@/store/pinia';

import { calculateIsAccessibleRoute } from '@/lib/access-control';
import { getRecentConfig } from '@/lib/helper/router-recent-helper';
import { GTag } from '@/lib/site-analytics/gtag';
import { getLastAccessedWorkspaceId } from '@/lib/site-initializer/last-accessed-workspace';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'SpaceRouter/ChunkLoadFailRefreshed';
const OLD_PATHS = [/^\/home-dashboard(?:\/(?=$))?$/i, /^\/dashboard(?:\/(?=$))?$/i];

const getCurrentTime = (): number => Math.floor(Date.now() / 1000);

const getDecodedDataFromAccessToken = (): {rol: string, wid: string} => {
    try {
        const accessToken = SpaceConnector.getAccessToken() as string;
        const { rol, wid } = jwtDecode<JwtPayload&{rol: string, wid: string}>(accessToken);
        return {
            rol,
            wid,
        };
    } catch (e) {
        console.error(e);
        return {
            rol: '',
            wid: '',
        };
    }
};

const getValidWorkspaceId = (workspaceId: string|undefined, workspaceList: WorkspaceModel[]): string|undefined => workspaceList.find((w) => w.workspace_id === workspaceId)?.workspace_id;

const grantAndLoadByCurrentScope = async (scope: GrantScope, workspaceId?: string): Promise<{ failStatus: boolean }> => {
    const refreshToken = SpaceConnector.getRefreshToken();
    const grantRequest = {
        scope,
        token: refreshToken,
        workspace_id: workspaceId,
    };

    await SpaceRouter.router.app?.$store.dispatch('user/grantRoleAndLoadReferenceData', grantRequest);
    const grantAcessFailStatus = SpaceRouter.router.app?.$store.state.error.grantAccessFailStatus;
    return {
        failStatus: !!grantAcessFailStatus,
    };
};

export class SpaceRouter {
    static router: VueRouter;

    static init(routes: RouteConfig[]) {
        if (SpaceRouter.router) throw new Error('Router init failed: Already initiated.');

        Vue.use(VueRouter);

        SpaceRouter.router = new VueRouter({
            mode: 'history',
            linkActiveClass: 'open active',
            routes,
        });

        let nextPath: string;
        const appContextStore = useAppContextStore(pinia);
        const userWorkspaceStore = useUserWorkspaceStore(pinia);

        SpaceRouter.router.onError((error) => {
            console.error(error);

            if (error.name === 'ChunkLoadError') {
                const lastCheckedTime = LocalStorageAccessor.getItem(CHUNK_LOAD_REFRESH_STORAGE_KEY);
                if (!lastCheckedTime) {
                    LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, getCurrentTime().toString());
                    window.location.href = nextPath ?? '/';
                } else if (getCurrentTime() - parseInt(lastCheckedTime) < 10) {
                    window.location.href = nextPath ?? '/';
                }
            }
        });

        SpaceRouter.router.onReady(() => {
            LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, '');
        });

        SpaceRouter.router.beforeEach(async (to, from, next) => {
            const isDirectAccessToOldPath = !to.name && OLD_PATHS.some((path) => path.test(to.path));
            if (isDirectAccessToOldPath) {
                next({ name: ROOT_ROUTE._NAME });
                return;
            }


            const isInvalidRoute = !!to?.name && to?.path === '/';
            const isTokenAlive = SpaceConnector.isTokenAlive;

            // 1. Common processes for all scope
            if (isInvalidRoute) {
                if (isTokenAlive) {
                    // AccessToken refers to data of existing scope.
                    const { rol } = getDecodedDataFromAccessToken();
                    // Admin to Admin Case
                    if (rol === 'DOMAIN_ADMIN') {
                        next({ name: makeAdminRouteName(to.name as string) });
                        return;
                    }

                    next({
                        name: ERROR_ROUTE._NAME, params: { statusCode: '404' },
                    });
                    return;
                }

                next({ name: AUTH_ROUTE.SIGN_OUT._NAME });
                return;
            }

            // 2. Processes by Scope
            const routeScope = getRouteScope(to);
            const grantFailStatus = SpaceRouter.router.app?.$store.getters['error/grantFailStatus'];

            // 2-1. Exclude Auth Page
            if (routeScope === 'EXCLUDE_AUTH') {
                if (to.meta?.isSignInPage) {
                    if (isTokenAlive) {
                        next({ name: ROOT_ROUTE._NAME });
                        return;
                    }
                }
                next();
                return;
            }

            // 2-2. Authenticated Page
            if (isTokenAlive) {
                // AccessToken refers to data of existing scope.
                const { rol: prevRole, wid: prevWorkspaceId } = getDecodedDataFromAccessToken();
                const isScopeChanged = !prevRole.startsWith(routeScope);
                const needNewScope = !prevRole;
                const exceptionScopeChangedCase = prevRole.startsWith('WORKSPACE') && routeScope === 'WORKSPACE';
                const needToChangeScope = isScopeChanged || needNewScope || exceptionScopeChangedCase;

                if (needToChangeScope) {
                    // 2-2-1. User Scope Route
                    if (routeScope === 'USER') {
                        const { failStatus } = await grantAndLoadByCurrentScope('USER');
                        if (failStatus) {
                            await userWorkspaceStore.load();
                            next({
                                name: ERROR_ROUTE._NAME,
                                params: { statusCode: '404' },
                            });
                        } else next();

                    // 2-2-2. Workspace Scope Route
                    } else if (routeScope === 'WORKSPACE') {
                        const workspaceList = userWorkspaceStore.getters.workspaceList;
                        if (!workspaceList.length) {
                            next({ name: MY_PAGE_ROUTE._NAME });
                            return;
                        }

                        const workspaceIdFromParams = to.params.workspaceId;
                        let targetWorkspaceId = workspaceIdFromParams;

                        if (workspaceIdFromParams) {
                            if (prevWorkspaceId === workspaceIdFromParams && !grantFailStatus) {
                                next();
                                return;
                            }
                        } else {
                            if (prevWorkspaceId) {
                                next({
                                    ...to,
                                    name: to.name as string,
                                    params: {
                                        ...to.params,
                                        workspaceId: prevWorkspaceId,
                                    },
                                    query: to.query,
                                });
                                return;
                            }

                            const lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();
                            if (lastAccessedWorkspaceId) {
                                targetWorkspaceId = lastAccessedWorkspaceId;
                            } else targetWorkspaceId = workspaceList[0].workspace_id;
                        }

                        if (!getValidWorkspaceId(targetWorkspaceId, workspaceList)) {
                            next({
                                name: ERROR_ROUTE._NAME,
                                params: { statusCode: '404' },
                            });
                        } else {
                            const { failStatus } = await grantAndLoadByCurrentScope('WORKSPACE', targetWorkspaceId);

                            if (failStatus) {
                                await userWorkspaceStore.load();
                                next({
                                    name: ERROR_ROUTE._NAME,
                                    params: { statusCode: '404' },
                                });
                            } else {
                                const pageAccessPermissionList = SpaceRouter.router.app?.$store.getters['user/pageAccessPermissionList'];
                                const isAccessibleRoute = calculateIsAccessibleRoute(to, pageAccessPermissionList);
                                if (isAccessibleRoute) {
                                    next({
                                        ...to,
                                        name: to.name as string,
                                        params: {
                                            ...to.params,
                                            workspaceId: targetWorkspaceId,
                                        },
                                        query: to.query,
                                    });
                                } else {
                                    next({
                                        name: HOME_DASHBOARD_ROUTE._NAME,
                                        params: { workspaceId: targetWorkspaceId },
                                    });
                                }
                            }
                        }




                    // 2-2-3. Domain Scope Route
                    } else if (routeScope === 'DOMAIN') {
                        const { failStatus } = await grantAndLoadByCurrentScope('DOMAIN');
                        if (failStatus) {
                            await userWorkspaceStore.load();
                            next({
                                name: ERROR_ROUTE._NAME,
                                params: { statusCode: '404' },
                            });
                        } else next();
                    }
                } else {
                    appContextStore.setGlobalGrantLoading(false);
                    next();
                }
            } else {
                if (to.name === AUTH_ROUTE.SIGN_OUT._NAME) {
                    next();
                    return;
                }
                next({
                    name: AUTH_ROUTE.SIGN_OUT._NAME,
                    query: { nextPath: to.fullPath },
                });
            }
        });

        SpaceRouter.router.afterEach((to) => {
            // set target page as GTag page view
            if (GTag.gtag) GTag.setPageView(to);

            const store = SpaceRouter.router.app?.$store;
            if (!store) return;
            const isAdminMode = appContextStore.getters.isAdminMode;
            const routeScope = getRouteScope(to);

            if (!isAdminMode && routeScope === 'WORKSPACE') {
                const recent = getRecentConfig(to);
                if (recent) {
                    store.dispatch('recent/addItem', {
                        itemType: recent.itemType,
                        workspaceId: recent.workspaceId,
                        itemId: recent.itemId,
                    });
                }
            }
        });

        return SpaceRouter.router;
    }
}
