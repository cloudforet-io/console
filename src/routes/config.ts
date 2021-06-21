// Views
import ErrorPage from '@/common/pages/ErrorPage.vue';
import SignOut from '@/common/pages/SignOut.vue';

// Routes
import signInRoute from '@/routes/sign-in/sign-in-route';
import dashboardRoute from '@/routes/dashboard/dashboard-route';
import identityRoute from '@/routes/identity/identity-route';
import inventoryRoute from '@/routes/inventory/inventory-route';
import pluginRoute from '@/routes/plugin/plugin-route';
import projectRoute from '@/routes/project/project-route';
import managementRoute from '@/routes/management/management-route';
import automationRoute from '@/routes/automation/automation-route';
import monitoringRoute from '@/routes/monitoring/monitoring-route';
import { RouterOptions } from 'vue-router';


export const routerOptions = {
    mode: 'history',
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/error-page',
            name: 'error',
            meta: { label: '', excludeAuth: true },
            component: ErrorPage,
        },
        {
            path: '/sign-out',
            name: 'SignOut',
            component: SignOut,
            meta: { label: '', excludeAuth: true, isSignInPage: false },
        },
        signInRoute,
        {
            path: '/',
            name: 'root',
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
    ],
    duplicateNavigationPolicy: 'reload',
} as RouterOptions;
