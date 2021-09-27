import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { GTag } from '@/lib/gtag';
import config from '@/lib/config';
import { IDENTITY_ROUTE } from '@/services/identity/routes';
import { DASHBOARD_ROUTE } from '@/services/dashboard/routes';
import { AUTH_ROUTE } from '@/services/auth/routes';
import { ERROR_ROUTE } from '@/router/error-routes';

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
                window.location.href = nextPath || '/';
            }
        });

        SpaceRouter.router.beforeEach(async (to, from, next) => {
            nextPath = to.fullPath;
            const isTokenAlive = SpaceConnector.isTokenAlive;
            let nextLocation;

            if (isTokenAlive) {
                const isAdmin = SpaceRouter.router.app.$store.getters['user/isAdmin'];
                const hasPermission = SpaceRouter.router.app.$store.getters['user/hasPermission'];
                if (to.meta?.isSignInPage) {
                    nextLocation = { name: DASHBOARD_ROUTE._NAME };
                } else if (to.meta?.isDomainOwnerOnly && !isAdmin) {
                    nextLocation = { name: ERROR_ROUTE._NAME };
                } else if (!hasPermission && to.name !== AUTH_ROUTE.SIGN_OUT._NAME) {
                    if (to.name !== IDENTITY_ROUTE.USER.ACCOUNT._NAME) nextLocation = { name: IDENTITY_ROUTE.USER.ACCOUNT._NAME };
                }
            } else if (!to.meta?.excludeAuth) {
                const res = await SpaceConnector.refreshAccessToken(false);
                if (!res) nextLocation = { name: AUTH_ROUTE.SIGN_OUT._NAME, query: { nextPath: to.fullPath } };
            }

            next(nextLocation);
        });

        SpaceRouter.router.afterEach((to, from) => {
            if (config.get('GTAG_ID') !== 'DISABLED') GTag.setPageView(to);
        });

        return SpaceRouter.router;
    }
}
