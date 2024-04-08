import type { RouteConfig } from 'vue-router';

import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import adminDashboardsRoutes from '@/services/dashboards/routes/admin/routes';
import adminIamRoutes from '@/services/iam/routes/admin/routes';
import adminInfoRoute from '@/services/info/routes/admin/routes';
import adminPreferenceRoutes from '@/services/preference/routes/admin/routes';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';


export const adminRoutes: RouteConfig[] = [
    adminWorkspaceHomeRoutes,
    adminDashboardsRoutes,
    adminCostExplorerRoutes,
    adminAssetInventoryRoutes,
    adminIamRoutes,
    adminPreferenceRoutes,
    adminInfoRoute,
];
