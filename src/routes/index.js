import Vue from 'vue';
import VueRouter from 'vue-router';

import { beforeEach } from './hooks';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';

import DefaultContainer from '@/views/containers/DefaultContainer.vue';
// Views
import SignIn from '@/views/sign-in/local/Local';
import GoolgeSignIn from '@/views/sign-in/oauth/GoogleOAuth';
import Admin from '@/views/sign-in/admin/Admin';
import Redirect404 from '@/views/common/404/Redirect404';


Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    hash: false,
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        {
            path: '/error-page',
            name: 'error',
            meta: { label: '', excludeAuth: true },
            component: Redirect404,
        },
        {
            path: '/sign-in',
            name: 'signinn',
            meta: { label: 'Sign In', excludeAuth: true },
            component: SignIn,
        },
        {
            path: '/google-sign-in',
            name: 'Google-Oauth-signin',
            meta: { label: 'google_oauth2', excludeAuth: true },
            component: GoolgeSignIn,
        },
        {
            path: '/admin-sign-in',
            name: 'Admin-SignIn',
            meta: { label: 'admin_sign', excludeAuth: true },
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
            ],
        },
        { path: '*', component: Redirect404 },
    ],
});

router.beforeEach(beforeEach);

export default router;
