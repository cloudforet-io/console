import type { RouteConfig } from 'vue-router';

import alertManagerRoute from '@/services/alert-manager/routes/routes';
import assetInventoryRoute from '@/services/asset-inventory-v1/routes/routes';
import costExplorerRoute from '@/services/cost-explorer/routes/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import iamRoutes from '@/services/iam/routes/routes';
import infoRoute from '@/services/info/routes/routes';
import projectRoute from '@/services/project/routes/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';


export const resourceManagerV1WorkspaceRoutes: RouteConfig[] = [
    workspaceHomeRoute,
    dashboardsRoute,
    iamRoutes,
    assetInventoryRoute,
    projectRoute,
    alertManagerRoute,
    costExplorerRoute,
    infoRoute,
];
