import Vue from 'vue';
import VueRouter from 'vue-router';
import jwt from 'jsonwebtoken';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';
import secretRoute from '@/routes/secret/secret-route';
import DefaultContainer from '@/views/containers/DefaultContainer.vue';
import pluginRoute from '@/routes/plugin/plugin-route';
import projectRoute from '@/routes/project/project-route';
import managementRoute from '@/routes/management/management-route';

// Views
import SignIn from '@/views/sign-in/Signin.vue';
import ErrorPage from '@/views/common/error/ErrorPage.vue';
import { ref } from '@vue/composition-api';

const DynamicLayoutHelper = () => import('@/views/common/helper/DynamicLayoutHelper.vue');
const QueryHelper = () => import('@/views/common/helper/QueryHelper.vue');
const ApiMaker = () => import('@/views/common/helper/ApiMaker.vue');
const ExportPdf = () => import('@/views/common/helper/ExportPdf.vue');
Vue.use(VueRouter);


const router = new VueRouter({
    mode: 'history',
    hash: false,
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/error-page',
            name: 'error',
            meta: { label: '', excludeAuth: true },
            component: ErrorPage,
        },
        {
            path: '/sign-in',
            component: { template: '<router-view />' },
            meta: {
                excludeAuth: true,
                isSignInPage: true,
            },
            children: [
                {
                    path: '/',
                    name: 'Login',
                    meta: {
                        excludeAuth: true,
                        isSignInPage: true,

                    },
                    props: route => ({
                        nextPath: route.query.nextPath || '/',
                    }),
                    component: SignIn,
                },
                {
                    path: 'admin',
                    name: 'AdminLogin',
                    meta: {
                        excludeAuth: true,
                        isSignInPage: true,

                    },
                    component: SignIn,
                    props: route => ({
                        admin: true,
                        nextPath: route.query.nextPath || '/',
                    }),
                },
            ],
        },
        {
            path: '/',
            name: 'root',
            meta: { label: 'root' },
            redirect: '/dashboard',
            component: DefaultContainer,
            children: [
                dashboardRoute,
                identityRoute,
                inventoryRoute,
                secretRoute,
                pluginRoute,
                projectRoute,
                managementRoute,
            ],
        },
        {
            path: '/helper',
            name: 'Helper',
            component: DynamicLayoutHelper,

        },
        {
            path: '/helper/query',
            name: 'QueryHelper',
            component: QueryHelper,

        },
        {
            path: '/helper/api',
            name: 'ApiMaker',
            component: ApiMaker,

        },
        {
            path: '/helper/pdf',
            name: 'ExportPdf',
            component: ExportPdf,

        },
        { path: '*', component: ErrorPage },
    ],
});

const hasLogIn = () => {
    const refreshTokenData = localStorage.getItem('user/refreshToken');
    if (refreshTokenData) {
        try {
            const refreshToken = JSON.parse(refreshTokenData).data;
            const decodedToken = jwt.decode(refreshToken);
            const expireTime = decodedToken.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            return (expireTime - currentTime) > 10;
        } catch (e) {
            return false;
        }
    }
    return false;
};
const isDomainOwner = () => JSON.parse(localStorage.getItem('user/userType')).data === 'DOMAIN_OWNER';


router.beforeEach(async (to, from, next) => {
    if (to.meta && to.meta.excludeAuth) {
        if (to.meta.isSignInPage) {
            if (hasLogIn()) {
                try {
                    next({ path: to.meta.query.nextPath });
                } catch (e) {
                    next('/');
                }
            }
        }
        next();
    } else if (hasLogIn()) {
        console.log(hasLogIn());
        if (to.meta && to.meta.isDomainOwnerOnly && !isDomainOwner()) {
            next({ name: 'error' });
        }
        next();
    } else {
        next({ name: 'Login', query: { nextPath: to.path } });
    }
});

export default router;
