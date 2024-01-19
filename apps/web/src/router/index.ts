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
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'SpaceRouter/ChunkLoadFailRefreshed';

const getCurrentTime = (): number => Math.floor(Date.now() / 1000);

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
            console.debug('SpaceRouter.beforeEach', to, from);
            if (!to.name) {
                next({ name: ROOT_ROUTE._NAME });
            }

            const allRoutes = SpaceRouter.router.getRoutes();
            const isValidRoute = allRoutes.find((route) => route.name === to.name);
            const isTokenAlive = SpaceConnector.isTokenAlive;
            const workspaceList = userWorkspaceStore.getters.workspaceList;

            // 1. Common processes for all scope
            if (!isValidRoute) {
                if (isTokenAlive) {
                    const accessToken = SpaceConnector.getAccessToken() as string;
                    const { rol } = jwtDecode<JwtPayload&{rol: string, wid: string}>(accessToken);

                    if (rol === 'DOMAIN_ADMIN' && to.name && !to.name?.startsWith('admin.')) {
                        next({ name: makeAdminRouteName(to.name) });
                    }
                    next({
                        name: ERROR_ROUTE._NAME, params: { statusCode: '404' },
                    });
                }

                next({ name: AUTH_ROUTE.SIGN_OUT._NAME });
            }

            // 2. Processes by Scope
            const routeScope = getRouteScope(to);
            let nextLocation;
            let grantFailStatus = false;

            if (routeScope === 'EXCLUDE_AUTH' && to.meta?.isSignInPage) {
                if (isTokenAlive) {
                    nextLocation = { name: ROOT_ROUTE._NAME };
                } else SpaceConnector.flushToken();
            } else if (isTokenAlive) {
                const accessToken = SpaceConnector.getAccessToken() as string;
                const { rol, wid } = jwtDecode<JwtPayload&{rol: string, wid: string}>(accessToken);
                const isSameScopeOrWorkspace = rol.startsWith(routeScope) && (routeScope === 'WORKSPACE' && wid === to.params.workspaceId);

                if (!isSameScopeOrWorkspace) {
                    if (routeScope === 'USER') {
                        const { failStatus } = await newGrantAndLoadByCurrentScope('USER');
                        grantFailStatus = failStatus;
                    } else if (routeScope === 'WORKSPACE') {
                        if (workspaceList.length > 0) {
                            const targetWorkspaceId = to.params.workspaceId;
                            if (targetWorkspaceId && !getAccessibleWorkspaceId(targetWorkspaceId, workspaceList)) {
                                next({
                                    name: ERROR_ROUTE._NAME,
                                    params: { statusCode: '404' },
                                });
                            }
                            const lastAccessedWorkspaceId = await getLastAccessedWorkspaceId();
                            const cachedAccessibleWorkspaceId = getAccessibleWorkspaceId(lastAccessedWorkspaceId, workspaceList);
                            const validWorkspaceId = targetWorkspaceId || cachedAccessibleWorkspaceId || workspaceList[0].workspace_id;
                            const { failStatus } = await newGrantAndLoadByCurrentScope('WORKSPACE', validWorkspaceId);
                            grantFailStatus = failStatus;

                            if (!failStatus) {
                                const pageAccessPermissionList = SpaceRouter.router.app?.$store.getters['user/pageAccessPermissionList'];
                                const isAccessibleRoute = calculateIsAccessibleRoute(to, pageAccessPermissionList);
                                if (isAccessibleRoute) {
                                    if (!targetWorkspaceId) {
                                        nextLocation = {
                                            ...to,
                                            params: {
                                                ...to.params,
                                                workspaceId: validWorkspaceId,
                                            },
                                        };
                                    }
                                } else {
                                    nextLocation = {
                                        name: ERROR_ROUTE._NAME,
                                        params: { statusCode: '403' },
                                    };
                                }
                            }
                        } else nextLocation = { name: MY_PAGE_ROUTE._NAME };
                    } else if (routeScope === 'DOMAIN') {
                        const { failStatus } = await newGrantAndLoadByCurrentScope('DOMAIN');
                        grantFailStatus = failStatus;
                    }
                }
            } else if (to.name !== AUTH_ROUTE.SIGN_OUT._NAME) {
                next({ name: AUTH_ROUTE.SIGN_OUT._NAME, query: { nextPath: to.fullPath } });
            }


            if (grantFailStatus) {
                await userWorkspaceStore.load();
                nextLocation = {
                    name: ERROR_ROUTE._NAME,
                    params: { statusCode: '404' },
                };
                SpaceRouter.router.app?.$store.commit('error/setGrantAccessFailStatus', false);
            }

            next(nextLocation);
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
