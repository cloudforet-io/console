import type { RouteConfig } from 'vue-router';

import adminAdministrationRoute from '@/services/administration/routes/admin/routes';
import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import adminDashboardsRoutes from '@/services/dashboards/routes/admin/routes';
import adminHomeDashboardRoutes from '@/services/home-dashboard/routes/admin/routes';
import adminInfoRoute from '@/services/info/routes/admin/routes';

export const adminRoutes: RouteConfig[] = [
    {
        path: 'dashboard',
        redirect: '/home-dashboard',
    },
    adminHomeDashboardRoutes,
    adminDashboardsRoutes,
    adminCostExplorerRoutes,
    adminAssetInventoryRoutes,
    adminAdministrationRoute,
    adminInfoRoute,
];
