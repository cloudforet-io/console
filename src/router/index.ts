import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { getRecentConfig } from '@/lib/helper/router-recent-helper';
import { GTag } from '@/lib/gtag';
import config from '@/lib/config';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import { ERROR_ROUTE } from '@/router/error-routes';
import { getRouteAccessLevel, isRouteAccessible, PAGE_ACCESS_LEVEL } from '@/lib/access-control';
// import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

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
                    window.location.href = nextPath || '/';
                } else if (getCurrentTime() - parseInt(lastCheckedTime) < 10) {
                    window.location.href = nextPath || '/';
                }
            }
        });

        SpaceRouter.router.onReady(() => {
            localStorage.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, '');
        });

        SpaceRouter.router.beforeEach(async (to, from, next) => {
            nextPath = to.fullPath;
            const isTokenAlive = SpaceConnector.isTokenAlive;
            let nextLocation;

            if (isTokenAlive) {
                const isAdmin = SpaceRouter.router.app.$store.getters['user/isAdmin'];

                if (to.meta?.isSignInPage) {
                    nextLocation = { name: DASHBOARD_ROUTE._NAME };
                } else if (to.meta?.isDomainOwnerOnly && !isAdmin) {
                    nextLocation = { name: ERROR_ROUTE._NAME };
                } else {
                    const isAccessible = isRouteAccessible(to, SpaceRouter.router.app.$store.getters['user/pagePermissionList']);
                    if (isAccessible) {
                        SpaceRouter.router.app.$store.dispatch('error/hideAuthorizationError');
                    } else {
                        SpaceRouter.router.app.$store.dispatch('error/showAuthorizationError');
                    }
                }
            } else if (getRouteAccessLevel(to) >= PAGE_ACCESS_LEVEL.REQUIRED_AUTH) {
                const res = await SpaceConnector.refreshAccessToken(false);
                if (!res) nextLocation = { name: AUTH_ROUTE.SIGN_OUT._NAME, query: { nextPath: to.fullPath } };
                else nextLocation = { name: to.name, params: to.params };
            }
            next(nextLocation);
        });

        SpaceRouter.router.afterEach((to) => {
            if (config.get('GTAG_ID') !== 'DISABLED') GTag.setPageView(to);
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
