import type { RouteConfig } from 'vue-router';


import alertManagerRoutesV2 from '@/services/alert-manager-v2/routes/routes';
import assetInventoryRouteV2 from '@/services/asset-inventory-v2/routes/routes';
import costExplorerRoute from '@/services/cost-explorer/routes/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import iamRoutes from '@/services/iam/routes/routes';
import infoRoute from '@/services/info/routes/routes';
import projectRoute from '@/services/project/routes/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';


export const workspaceRoutes: RouteConfig[] = [
    workspaceHomeRoute,
    dashboardsRoute,
    iamRoutes,
    assetInventoryRouteV2,
    projectRoute,
    alertManagerRoutesV2,
    costExplorerRoute,
    infoRoute,
];
