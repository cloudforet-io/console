import type { RouteConfig } from 'vue-router';

import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';
import costExplorerRoute from '@/services/cost-explorer/routes/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import iamRoutes from '@/services/iam/routes/routes';
import infoRoute from '@/services/info/routes/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';
import projectRoute from '@/services/project/v1/routes/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';


export const alertManagerV1WorkspaceRoutes: RouteConfig[] = [
    workspaceHomeRoute,
    dashboardsRoute,
    iamRoutes,
    assetInventoryRoute,
    projectRoute,
    alertManagerRouteV1,
    costExplorerRoute,
    infoRoute,
    opsFlowRoutes,
];
