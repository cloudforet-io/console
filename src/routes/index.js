import Vue from 'vue';
import Router from 'vue-router';

import { beforeEach } from './hooks';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const LogIn = () => import('@/views/sign-in/local/LocalSignIn');
const GoolgeLogIn = () => import('@/views/sign-in/o-auth/GoogleOAuthSignIn');
const AdminLogIn = () => import('@/views/sign-in/admin-only/AdminOnlySignIn');
const Redirect404 = () => import('@/views/common/404/Redirect404');


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
            component: Redirect404
        },
        {
            path: '/log-in',
            name: 'logIn',
            meta: { label: 'Log In', requiresAuth: false, requiresDomainCheck: true },
            component: LogIn
        },
        {
            path: '/google-log-in',
            name: 'Google-Oauth-logIn',
            meta: { label: 'google_oauth2', requiresAuth: false, requiresDomainCheck: true },
            component: GoolgeLogIn
        },
        {
            path: '/admin-log-in',
            name: 'Admin-logIn',
            meta: { label: 'admin_login', requiresAuth: false, requiresDomainCheck: true },
            component: AdminLogIn
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
                inventoryRoute
            ]
        },
        { path: '*', component: Redirect404 }
    ]
});


index.beforeEach(beforeEach);

export default index;
