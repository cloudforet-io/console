import Vue from 'vue';
import VueRouter from 'vue-router';
import { SpaceConnector } from '@/lib/space-connector';
import { routerOptions } from '@/routes/config';


Vue.use(VueRouter);


const router = new VueRouter(routerOptions);

router.beforeEach(async (to, from, next) => {
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
        if (to.meta && to.meta.isDomainOwnerOnly && router.app.$store.state.user.userType !== 'DOMAIN_OWNER') {
            next({ name: 'error' });
        }
        next();
    } else {
        next({ name: 'SignOut' });
    }
});


export default router;
