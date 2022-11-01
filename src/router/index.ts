import Vue from 'vue';
import type { RouteConfig } from 'vue-router';
import VueRouter from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ERROR_ROUTE } from '@/router/error-routes';

import { getRouteAccessLevel, getUserAccessLevel } from '@/lib/access-control';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import config from '@/lib/config';
import { GTag } from '@/lib/gtag';
import { getRecentConfig } from '@/lib/helper/router-recent-helper';

import { AUTH_ROUTE } from '@/services/auth/route-config';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/route-config';

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
                const lastCheckedTime = localStorage.getItem(CHUNK_LOAD_REFRESH_STORAGE_KEY);
                if (!lastCheckedTime) {
                    localStorage.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, getCurrentTime().toString());
                    window.location.href = nextPath ?? '/';
                } else if (getCurrentTime() - parseInt(lastCheckedTime) < 10) {
                    window.location.href = nextPath ?? '/';
                }
            }
        });

        SpaceRouter.router.onReady(() => {
            localStorage.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, '');
        });

        SpaceRouter.router.beforeEach(async (to, from, next) => {
            nextPath = to.fullPath;
            const isTokenAlive = SpaceConnector.isTokenAlive;
            const userPagePermissions = SpaceRouter.router.app?.$store.getters['user/pagePermissionList'];
            const routeAccessLevel = getRouteAccessLevel(to);
            const userAccessLevel = getUserAccessLevel(to.name, userPagePermissions, isTokenAlive);
            const userNeedPwdReset = SpaceRouter.router.app?.$store.getters['user/isUserNeedPasswordReset'];
            let nextLocation;

            // When a user is authenticated
            if (userAccessLevel >= ACCESS_LEVEL.AUTHENTICATED) {
                // When a user need to reset password and tries to go to other pages, redirect to reset password page
                if (userNeedPwdReset && to.name !== AUTH_ROUTE.RESET_PASSWORD._NAME && to.name !== AUTH_ROUTE.SIGN_OUT._NAME) {
                    nextLocation = { name: AUTH_ROUTE.RESET_PASSWORD._NAME };
                // When a user is already signed in and tries to go to sign in page, redirect to home-dashboard page
                } else if (to.meta?.isSignInPage) {
                    nextLocation = { name: HOME_DASHBOARD_ROUTE._NAME };
                // When a user tries to go to inaccessible page, redirect to error page
                } else if (userAccessLevel < routeAccessLevel) {
                    nextLocation = { name: ERROR_ROUTE._NAME };
                }
            // When an unauthenticated(or token expired) user tries to access a page that only authenticated users can enter, refresh token
            } else if (routeAccessLevel >= ACCESS_LEVEL.AUTHENTICATED) {
                if (!isTokenAlive) {
                    // When refreshing token is failed, redirect to sign in page
                    const res = await SpaceConnector.refreshAccessToken(false);
                    if (!res) nextLocation = { name: AUTH_ROUTE.SIGN_OUT._NAME, query: { nextPath: to.fullPath } };
                }
            }

            next(nextLocation);
        });

        SpaceRouter.router.afterEach((to) => {
            if (config.get('GTAG_ID') !== 'DISABLED') GTag.setPageView(to);
            if (SpaceRouter.router.app.$store.state.error.visibleAuthorizationError) { SpaceRouter.router.app.$store.commit('error/setVisibleAuthorizationError', false); }
            const isDomainOwner = SpaceRouter.router.app.$store.getters['user/isDomainOwner'];
            if (!isDomainOwner) {
                const recent = getRecentConfig(to);
                if (recent) {
                    SpaceRouter.router.app.$store.dispatch('recent/addItem', {
                        itemType: recent.itemType,
                        itemId: recent.itemId,
                    });
                }
            }
        });

        return SpaceRouter.router;
    }
}
