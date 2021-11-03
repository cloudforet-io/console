import { RouteConfig } from 'vue-router';

// Routes
import authRoutes from '@/services/auth/routes';
import dashboardRoute, { DASHBOARD_ROUTE } from '@/services/dashboard/routes';
import identityRoute from '@/services/identity/routes';
import inventoryRoute from '@/services/inventory/routes';
import pluginRoute from '@/services/plugin/routes';
import projectRoute from '@/services/project/routes';
import managementRoute from '@/services/management/routes';
import automationRoute from '@/services/automation/routes';
import monitoringRoute from '@/services/monitoring/routes';
import billingRoute from '@/services/billing/routes';
import { errorRoutes } from '@/router/error-routes';


export const ROOT_ROUTE = Object.freeze({
    _NAME: 'root',
});

export const serviceRoutes: RouteConfig[] = [
    ...authRoutes,
    {
        path: '/',
        name: ROOT_ROUTE._NAME,
        redirect: () => ({ name: DASHBOARD_ROUTE._NAME }),
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
            billingRoute,
        ],
    },
    ...errorRoutes,
];
