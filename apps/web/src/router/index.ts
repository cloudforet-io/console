import Vue from 'vue';
import type { RouteConfig, RouteRecord } from 'vue-router';
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

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'SpaceRouter/ChunkLoadFailRefreshed';

const getCurrentTime = (): number => Math.floor(Date.now() / 1000);

const getDecodedDataFromAccessToken = (): {rol: string, wid?: string} => {
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

const getAccessibleWorkspaceId = (workspaceId: string|undefined, workspaceList: WorkspaceModel[]): string|undefined => workspaceList.find((w) => w.workspace_id === workspaceId)?.workspace_id;

const newGrantAndLoadByCurrentScope = async (scope: GrantScope, workspaceId?: string): Promise<{ failStatus: boolean }> => {
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
            if (!to.name) {
                next({ name: ROOT_ROUTE._NAME });
                return;
            }

            const routeScope = getRouteScope(to);
            const workspaceList = userWorkspaceStore.getters.workspaceList;
            const allRoutes = SpaceRouter.router.getRoutes() as RouteRecord[];
            const targetRouterRecord = allRoutes.find((route) => route.name === to.name);
            const invalidWorkspaceRoute = routeScope === 'WORKSPACE' && (!to.params.workspaceId || !workspaceList.length);
            const isValidRoute = targetRouterRecord && targetRouterRecord.regex?.test(to.path) && !invalidWorkspaceRoute;
            const isTokenAlive = SpaceConnector.isTokenAlive;
            // AccessToken refers to data of existing scope.
            const { rol, wid } = getDecodedDataFromAccessToken();

            // 1. Common processes for all scope
            if (!isValidRoute) {
                if (isTokenAlive) {
                    // Admin to Admin Case
                    if (rol === 'DOMAIN_ADMIN' && to.name && !to.name?.startsWith('admin.')) {
                        next({ name: makeAdminRouteName(to.name) });
                        return;
                    }

                    if (invalidWorkspaceRoute) {
                        if (!workspaceList.length) {
                            next({ name: MY_PAGE_ROUTE._NAME });
                            return;
                        }

                        const workspaceId = wid || await appContextStore.getValidLastAccessedWorkspaceId() || workspaceList[0].workspace_id;
                        next({
                            ...to,
                            name: to.name,
                            params: {
                                ...to.params,
                                workspaceId,
                            },
                        });
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
            let nextLocation;
            let grantFailStatus = false;

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

            if (isTokenAlive) {
                const isScopeChanged = !rol.startsWith(routeScope);
                const exceptionScopeChangedCase = rol.startsWith('WORKSPACE') && routeScope === 'WORKSPACE';
                const needToChangeScope = isScopeChanged || exceptionScopeChangedCase;

                if (needToChangeScope) {
                    if (routeScope === 'USER') {
                        const { failStatus } = await newGrantAndLoadByCurrentScope('USER');
                        grantFailStatus = failStatus;
                    } else if (routeScope === 'WORKSPACE') {
                        const targetWorkspaceId = to.params.workspaceId;
                        if (wid && wid === targetWorkspaceId) {
                            next();
                            return;
                        }

                        if (!getAccessibleWorkspaceId(targetWorkspaceId, workspaceList)) {
                            next({
                                name: ERROR_ROUTE._NAME,
                                params: { statusCode: '404' },
                            });
                            return;
                        }

                        const { failStatus } = await newGrantAndLoadByCurrentScope('WORKSPACE', targetWorkspaceId);
                        grantFailStatus = failStatus;

                        if (!failStatus) {
                            const pageAccessPermissionList = SpaceRouter.router.app?.$store.getters['user/pageAccessPermissionList'];
                            const isAccessibleRoute = calculateIsAccessibleRoute(to, pageAccessPermissionList);
                            if (!isAccessibleRoute) {
                                nextLocation = {
                                    name: ERROR_ROUTE._NAME,
                                    params: { statusCode: '403' },
                                };
                            }
                        }
                    } else if (routeScope === 'DOMAIN') {
                        const { failStatus } = await newGrantAndLoadByCurrentScope('DOMAIN');
                        grantFailStatus = failStatus;
                    }
                } else appContextStore.setGlobalGrantLoading(false);

                if (grantFailStatus) {
                    await userWorkspaceStore.load();
                    nextLocation = {
                        name: ERROR_ROUTE._NAME,
                        params: { statusCode: '404' },
                    };
                    SpaceRouter.router.app?.$store.commit('error/setGrantAccessFailStatus', false);
                }

                next(nextLocation);
            } else if (to.name !== AUTH_ROUTE.SIGN_OUT._NAME) {
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
