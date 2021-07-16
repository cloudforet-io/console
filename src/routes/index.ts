import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { routerOptions } from '@/routes/config';
import { GTag } from '@/lib/gtag';
import config from '@/lib/config';


Vue.use(VueRouter);

const router = new VueRouter(routerOptions);

let nextPath: string;

router.onError((error) => {
    console.error(error);

    if (error.name === 'ChunkLoadError') {
        window.location.href = nextPath || '/';
    }
});

router.beforeEach(async (to, from, next) => {
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
        const isAdmin = router.app.$store.getters['user/isAdmin'];
        if (to.meta && to.meta.isDomainOwnerOnly && !isAdmin) {
            next({ name: 'error' });
        }
        next();
    } else if (!to.meta?.excludeAuth && !SpaceConnector.isTokenAlive) {
        await router.push({ name: 'SignOut', query: { nextPath: to.fullPath, error: to.query.error } });
        next();
    } else {
        next();
    }
});

router.afterEach((to, from) => {
    if (config.get('GTAG_ID') !== 'DISABLED') GTag.setPageView(to);
});

export default router;
