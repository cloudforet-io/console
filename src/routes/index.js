import Vue from 'vue';
import Router from 'vue-router';

import { beforeEach } from './hooks';

// Routes
import dashboardRoute from '@/routes/dashboard/dashboard_route';
import identityRoute from '@/routes/identity/identity_route';
import inventoryRoute from '@/routes/inventory/inventory_route';

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer');

// Views
const LogIn = () => import('@/views/login/local/LOLO_001_LogIn');
const GoolgeLogIn = () => import('@/views/login/oauth/LOOA_001_LogInGoogleOauth');
const AdminLogIn = () => import('@/views/login/only_admin/LOOA_001_AdminOnlyLogIn');
const Redirect404 = () => import('@/views/common/VICO_003_Redirect404');


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
