import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { GTag } from '@/lib/gtag';
import config from '@/lib/config';

export class SpaceRouter {
    static router: VueRouter;

    static init(routes: RouteConfig[]) {
        console.debug('init router');
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

            if (to.meta && to.meta.excludeAuth) {
                if (to.meta.isSignInPage) {
                    if (SpaceConnector.isTokenAlive) {
                        try {
                            next({ path: to.meta.query.nextPath });
                        } catch (e) {
                            next('/');
                        }
                    }
                }
                next();
            } else if (SpaceConnector.isTokenAlive) {
                const isAdmin = SpaceRouter.router.app.$store.getters['user/isAdmin'];
                if (to.meta && to.meta.isDomainOwnerOnly && !isAdmin) {
                    next({ name: 'error' });
                }
                next();
            } else if (!to.meta?.excludeAuth && !SpaceConnector.isTokenAlive) {
                await SpaceRouter.router.push({ name: 'SignOut', query: { nextPath: to.fullPath, error: to.query.error } });
                next();
            } else {
                next();
            }
        });

        SpaceRouter.router.afterEach((to, from) => {
            if (config.get('GTAG_ID') !== 'DISABLED') GTag.setPageView(to);
        });

        return SpaceRouter.router;
    }
}
