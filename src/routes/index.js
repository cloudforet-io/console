import Vue from 'vue';
import Router from 'vue-router';

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


Vue.use(Router);

const index = new Router({
    mode: 'history',
    hash: false,
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        {
            path: '/error-page',
            name: 'error',
            meta: { label: '', requiresAuth: false, requiresDomainCheck: true },
            component: Redirect404,
        },
        {
            path: '/sign-in',
            name: 'signIn',
            meta: { label: 'Sign In', requiresAuth: false, requiresDomainCheck: true },
            component: SignIn,
        },
        {
            path: '/google-sign-in',
            name: 'googleOAuthSignIn',
            meta: { label: 'google_oauth2', requiresAuth: false, requiresDomainCheck: true },
            component: GoolgeSignIn,
        },
        {
            path: '/admin-sign-in',
            name: 'adminSignIn',
            meta: { label: 'admin_sign', requiresAuth: false, requiresDomainCheck: true },
            component: Admin,
        },
        {
            path: '/',
            name: 'root',
            meta: { label: 'root', requiresDomainCheck: true },
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


index.beforeEach(beforeEach);

export default index;
