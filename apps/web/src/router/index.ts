import Vue from 'vue';
import type { RouteConfig } from 'vue-router';
import VueRouter from 'vue-router';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ERROR_ROUTE } from '@/router/constant';
import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { getRouteAccessLevel, getUserAccessLevel } from '@/lib/access-control';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRecentConfig } from '@/lib/helper/router-recent-helper';
import { GTag } from '@/lib/site-analytics/gtag';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'SpaceRouter/ChunkLoadFailRefreshed';

const getCurrentTime = (): number => Math.floor(Date.now() / 1000);

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
            nextPath = to.fullPath;
            const isTokenAlive = SpaceConnector.isTokenAlive;

            // CAUTION: you must recover this after new role rebuild
            const userPagePermissions = SpaceRouter.router.app?.$store.getters['user/pagePermissionList'];
            const routeAccessLevel = getRouteAccessLevel(to);
            const userAccessLevel = getUserAccessLevel(to, SpaceRouter.router.app?.$store.getters['user/isDomainAdmin'], userPagePermissions, isTokenAlive);


            const isAdminMode = SpaceRouter.router.app?.$pinia.state.value['app-context-store'].getters.isAdminMode;
            const userNeedPwdReset = SpaceRouter.router.app?.$store.getters['user/isUserNeedPasswordReset'];
            let nextLocation;


            // Grant API Key
            const refreshToken = SpaceConnector.getRefreshToken();
            const isDuplicatedRoute = to.name === from.name;
            if (refreshToken && isTokenAlive && !isDuplicatedRoute) {
                let scope: string;
                if (to.name?.startsWith('admin.')) {
                    scope = 'DOMAIN';
                } else if (to.params.workspaceId) {
                    scope = 'WORKSPACE';
                } else scope = 'USER';
                const grantRequest = {
                    scope,
                    workspace_id: to.params.workspaceId,
                    token: refreshToken,
                };

                await SpaceRouter.router.app.$store.dispatch('user/grantRole', grantRequest);
            }

            /* Redirect Logic for Workspace and Admin Modes
            * The router automatically converts a 'workspace' route (e.g., 'dashboards.all') to its 'admin' equivalent
            * (e.g., 'admin.dashboards.all') when in admin mode, ensuring mode-appropriate navigation.
             */
            if (userAccessLevel >= ACCESS_LEVEL.AUTHENTICATED && isAdminMode && to.name && !to.name?.startsWith('admin.')) {
                const adminRouteName = makeAdminRouteName(to.name);
                const resolved = SpaceRouter.router.resolve({ name: adminRouteName });
                const adminRouteAccessLevel = getRouteAccessLevel(resolved.route);
                const adminUserAccessLevel = getUserAccessLevel(resolved.route, SpaceRouter.router.app?.$store.getters['user/isDomainAdmin'], userPagePermissions, isTokenAlive);

                if (adminRouteAccessLevel === ACCESS_LEVEL.ADMIN_PERMISSION && adminUserAccessLevel === ACCESS_LEVEL.ADMIN_PERMISSION) {
                    nextLocation = {
                        ...to,
                        name: makeAdminRouteName(to.name),
                    };
                } else {
                    nextLocation = {
                        name: ERROR_ROUTE._NAME,
                        params: { statusCode: '404' },
                    };
                }
            }

            // When a user is authenticated
            if (userAccessLevel >= ACCESS_LEVEL.AUTHENTICATED) {
                // When a user need to reset password and tries to go to other pages, redirect to reset password page
                if (userNeedPwdReset && to.name !== AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME && to.name !== AUTH_ROUTE.SIGN_OUT._NAME) {
                    nextLocation = { name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME };
                // When a user is already signed in and tries to go to sign in page, redirect to home-dashboard page
                } else if (to.meta?.isSignInPage) {
                    nextLocation = { name: HOME_DASHBOARD_ROUTE._NAME };
                // When a user tries to go to inaccessible page, redirect to error page
                } else if (userAccessLevel < routeAccessLevel) {
                    nextLocation = { name: ERROR_ROUTE._NAME, params: { statusCode: '403' } };
                }
            // When an unauthenticated(or token expired) user tries to access a page that only authenticated users can enter, refresh token
            } else if (routeAccessLevel >= ACCESS_LEVEL.AUTHENTICATED) {
                if (!isTokenAlive) {
                    // When refreshing token is failed, redirect to sign in page
                    const res = await SpaceConnector.refreshAccessToken(false);
                    if (!res) nextLocation = { name: AUTH_ROUTE.SIGN_OUT._NAME, query: { nextPath: to.fullPath } };
                }
            }

            // If top notification which indicates authorization error is visible, clear it before moving to next location
            if (SpaceRouter.router.app?.$store.state.error.visibleAuthorizationError) {
                SpaceRouter.router.app?.$store.commit('error/setVisibleAuthorizationError', false);
            }

            next(nextLocation);
        });

        SpaceRouter.router.afterEach((to) => {
            // set target page as GTag page view
            if (GTag.gtag) GTag.setPageView(to);

            const store = SpaceRouter.router.app?.$store;
            if (!store) return;

            const isDomainAdmin = store.getters['user/isDomainAdmin'];
            if (!isDomainAdmin) {
                const recent = getRecentConfig(to);
                if (recent) {
                    store.dispatch('recent/addItem', {
                        itemType: recent.itemType,
                        itemId: recent.itemId,
                    });
                }
            }
        });

        return SpaceRouter.router;
    }
}
