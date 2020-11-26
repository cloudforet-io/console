import Vue from 'vue';
import VueRouter from 'vue-router';
import { SpaceConnector } from '@/lib/space-connector';
import { routerOptions } from '@/routes/config';


Vue.use(VueRouter);


const router = new VueRouter(routerOptions);

const isDomainOwner = () => JSON.parse(localStorage.getItem('user/userType') as string).data === 'DOMAIN_OWNER';

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
        if (to.meta && to.meta.isDomainOwnerOnly && !isDomainOwner()) {
            next({ name: 'error' });
        }
        next();
    }
    else {
        next({ name: 'Login', query: { nextPath: to.path } });
    }
});


export default router;
