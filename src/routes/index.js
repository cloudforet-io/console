import Vue from 'vue';
import VueRouter from 'vue-router';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';
import secretRoute from '@/routes/secret/secret-route';
import DefaultContainer from '@/views/containers/DefaultContainer.vue';

// Views
// import SignIn from '@/views/sign-in/local/Local.vue';
import SignIn from '@/views/sign-in/Signin.vue';
import GoolgeSignIn from '@/views/sign-in/oauth/GoogleOAuth.vue';
import Admin from '@/views/sign-in/admin/Admin.vue';
import ErrorPage from '@/views/common/error/ErrorPage.vue';
import store from '@/store';

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
                        props: route => ({
                            nextPath: route.query.nextPath || '/',
                        }),
                    },
                    component: SignIn,
                },
                {
                    path: 'admin',
                    name: 'AdminLogin',
                    meta: {
                        excludeAuth: true,
                        isSignInPage: true,
                        props: route => ({
                            admin: true,
                            nextPath: route.query.nextPath || '/',
                        }),
                    },
                    component: SignIn,
                },
            ],
        },
        {
            path: '/google-sign-in',
            name: 'GoogleOauthSignIn',
            meta: { label: 'google_oauth2', excludeAuth: true, isSignInPage: true },
            component: GoolgeSignIn,
        },
        {
            path: '/admin-sign-in',
            name: 'Admin-SignIn',
            meta: { label: 'admin_sign', excludeAuth: true, isSignInPage: true },
            component: Admin,
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
            ],
        },
        { path: '*', component: ErrorPage },
    ],
});

const hasLogIn = () => !!localStorage.getItem('user/refreshToken');

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
        next();
    } else {
        next({ name: 'Login', query: { nextPath: to.path } });
    }
});

export default router;
