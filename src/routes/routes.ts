// Views
import ErrorPage from '@/common/pages/ErrorPage.vue';
import SignOut from '@/common/pages/SignOut.vue';

// Routes
import signInRoute, { SIGN_IN_ROUTE } from '@/routes/sign-in/sign-in-route';
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';
import pluginRoute from '@/routes/plugin/plugin-route';
import projectRoute from '@/routes/project/project-route';
import managementRoute from '@/routes/management/management-route';
import automationRoute from '@/routes/automation/automation-route';
import monitoringRoute from '@/routes/monitoring/monitoring-route';
import { RouteConfig } from 'vue-router';

export const ROOT_ROUTE = Object.freeze({
    _NAME: 'root',
    ERROR: { _NAME: 'error' },
    SIGN_OUT: { _NAME: 'SignOut' },
    SIGN_IN: SIGN_IN_ROUTE,
});

export const routes: RouteConfig[] = [
    {
        path: '/error-page',
        name: ROOT_ROUTE.ERROR._NAME,
        meta: { label: '', excludeAuth: true },
        component: ErrorPage,
    },
    {
        path: '/sign-out',
        name: ROOT_ROUTE.SIGN_OUT._NAME,
        component: SignOut,
        meta: { label: '', excludeAuth: true, isSignInPage: false },
    },
    signInRoute,
    {
        path: '/',
        name: ROOT_ROUTE._NAME,
        meta: { label: 'root' },
        redirect: '/dashboard',
        component: { template: '<router-view />' },
        children: [
            dashboardRoute,
            identityRoute,
            inventoryRoute,
            pluginRoute,
            projectRoute,
            managementRoute,
            automationRoute,
            monitoringRoute,
        ],
    },
    { path: '*', component: ErrorPage },
];
