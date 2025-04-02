import type { RouteConfig } from 'vue-router';


import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';
import costExplorerRoute from '@/services/cost-explorer/routes/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import iamRoutes from '@/services/iam/routes/routes';
import infoRoute from '@/services/info/routes/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';
import projectRoute from '@/services/project/v1/routes/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';


export const workspaceRoutes: RouteConfig[] = [
    workspaceHomeRoute,
    dashboardsRoute,
    iamRoutes,
    assetInventoryRoute,
    projectRoute,
    alertManagerRoute,
    costExplorerRoute,
    infoRoute,
    opsFlowRoutes,
];
