import type { RouteConfig } from 'vue-router';


import alertManagerRoute from '@/services/alert-manager/routes/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';
import costExplorerRoute from '@/services/cost-explorer/routes/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import homeDashboardRoute from '@/services/home-dashboard/routes/routes';
import iamRoutes from '@/services/iam/routes/routes';
import infoRoute from '@/services/info/routes/routes';
import landingPageRoutes from '@/services/landing/routes/routes';
import projectRoute from '@/services/project/routes/routes';


export const workspaceRoutes: RouteConfig[] = [
    {
        path: 'dashboard',
        redirect: '/home-dashboard',
    },
    landingPageRoutes,
    homeDashboardRoute,
    dashboardsRoute,
    iamRoutes,
    assetInventoryRoute,
    projectRoute,
    alertManagerRoute,
    costExplorerRoute,
    infoRoute,
];
