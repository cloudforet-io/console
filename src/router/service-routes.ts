import { RouteConfig } from 'vue-router';

// Routes
import authRoutes from '@/services/auth/routes';
import dashboardRoute from '@/services/dashboard/routes';
import identityRoute from '@/services/administration/routes';
import inventoryRoute from '@/services/asset-management/routes';
import projectRoute from '@/services/project/routes';
import automationRoute from '@/services/automation/routes';
import monitoringRoute from '@/services/alert-manager/routes';
import billingRoute from '@/services/cost-explorer/routes';
import myPageRoute from '@/services/my-page/routes';
import { errorRoutes } from '@/router/error-routes';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';


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
            projectRoute,
            automationRoute,
            monitoringRoute,
            billingRoute,
            myPageRoute,
        ],
    },
    ...errorRoutes,
];
