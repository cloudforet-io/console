import type { RouteConfig } from 'vue-router';


import config from '@/lib/config';

import adminAdvancedRoutes from '@/services/advanced/routes/admin/routes';
import AlertManagerConfigurator from '@/services/alert-manager/configurator';
import AssetInventoryConfigurator from '@/services/asset-inventory/configurator';
import CostExplorerConfigurator from '@/services/cost-explorer/configurator';
import DashboardConfigurator from '@/services/dashboards/configurator';
import IamConfigurator from '@/services/iam/configurator';
import adminInfoRoute from '@/services/info/routes/admin/routes';
import infoRoute from '@/services/info/routes/routes';
import OpsFlowConfigurator from '@/services/ops-flow/configurator';
import ProjectConfigurator from '@/services/project/configurator';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';

import type { ServiceConfig } from '@/service-configurator/type';

export interface ServiceConfig {
    ENABLED: boolean;
    VERSION: string;
}

interface GlobalConfig {
    SERVICES: {
        [key: string]: ServiceConfig;
    };
}

class ServiceConfigurator {
    private config: GlobalConfig | null = null;

    private featureConfigurators: Record<string, any> = {
        DASHBOARD: DashboardConfigurator,
        PROJECT: ProjectConfigurator,
        ASSET_INVENTORY: AssetInventoryConfigurator,
        COST_EXPLORER: CostExplorerConfigurator,
        OPS_FLOW: OpsFlowConfigurator,
        ALERT_MANAGER: AlertManagerConfigurator,
        IAM: IamConfigurator,
    };

    async initialize() {
        await config.init();
        this.config = config.get('SERVICES') || {};
    }

    getRoutes(mode: 'admin' | 'workspace'): RouteConfig[] {
        if (!this.config) {
            throw new Error('ServiceConfigurator is not initialized.');
        }

        const baseRoutes = mode === 'admin'
            ? [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoute]
            : [workspaceHomeRoute, infoRoute];

        Object.entries(this.config).forEach(([serviceName, serviceConfig]) => {
            if (serviceConfig.ENABLED) {
                const configurator = this.featureConfigurators[serviceName];
                if (configurator) {
                    const route = mode === 'admin'
                        ? configurator.getAdminRoutes(serviceConfig.VERSION)
                        : configurator.getWorkspaceRoutes(serviceConfig.VERSION);
                    if (route && !baseRoutes.some((existingRoute) => existingRoute.path === route.path)) {
                        baseRoutes.push(route);
                    }
                }
            }
        });

        return baseRoutes;
    }
}

export default new ServiceConfigurator();
