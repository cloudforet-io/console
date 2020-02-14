import Vue from 'vue';
import VueRouter from 'vue-router';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';
import secretRoute from '@/routes/secret/secret-route';
import DefaultContainer from '@/views/containers/DefaultContainer.vue';

// Views
import SignIn from '@/views/sign-in/local/Local.vue';
import GoolgeSignIn from '@/views/sign-in/oauth/GoogleOAuth.vue';
import Admin from '@/views/sign-in/admin/Admin.vue';
import ErrorPage from '@/views/common/error/ErrorPage.vue';
import api from '@/lib/api';
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
            name: 'SignIn',
            meta: { label: 'Sign In', excludeAuth: true, isSignInPage: true },
            component: SignIn,
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


router.beforeEach(async (to, from, next) => {
    console.log('isSignedIn', store.getters['auth/isSignedIn']);
    console.log('domain_id', store.getters['domain/id']);
    if (store.getters['domain/id']) {
        if (to.meta && !to.meta.excludeAuth && !store.getters['auth/isSignedIn']) {
            console.log('test', store.getters['auth/isSignedIn']);
            const nextPath = store.getters['domain/loginPath'];
            next(nextPath);
        } else {
            next();
        }
    } else {
        console.log('else');
        localStorage.setItem('common.toMeta', JSON.stringify(to.meta));
        localStorage.setItem('common.toNextPath', to.path);
        console.log(to.path);
        next();
    }
});

export default router;
