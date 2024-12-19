import type { RouteConfig } from 'vue-router';


import alertManagerRoutesV2 from '@/services/alert-manager-v2/routes/routes';
import assetInventoryRouteV1 from '@/services/asset-inventory-v1/routes/routes';
import costExplorerRoute from '@/services/cost-explorer/routes/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import iamRoutes from '@/services/iam/routes/routes';
import infoRoute from '@/services/info/routes/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';
import projectRoutesV2 from '@/services/project-v2/routes/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';


export const workspaceRoutes: RouteConfig[] = [
    workspaceHomeRoute,
    dashboardsRoute,
    iamRoutes,
    assetInventoryRouteV1,
    projectRoutesV2,
    alertManagerRoutesV2,
    costExplorerRoute,
    infoRoute,
    opsFlowRoutes,
];
