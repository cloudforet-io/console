import type { RouteConfig } from 'vue-router';

import { isEmpty } from 'lodash';

import { useMenuStore } from '@/store/menu/menu-store';

import { FeatureSchemaManager } from '@/lib/config/global-config/feature-schema-manager';
import type { FeatureSchemaType, GlobalServiceConfig } from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { DEFAULT_ADMIN_MENU_LIST, DEFAULT_MENU_LIST } from '@/lib/menu/menu-architecture';

import adminAdvancedRoutes from '@/services/advanced/routes/admin/routes';
import AlertManagerConfigurator from '@/services/alert-manager/configurator';
import AssetInventoryConfigurator from '@/services/asset-inventory/configurator';
import CostExplorerConfigurator from '@/services/cost-explorer/configurator';
import DashboardConfigurator from '@/services/dashboards/configurator';
import IamConfigurator from '@/services/iam/configurator';
import adminInfoRoutes from '@/services/info/routes/admin/routes';
import infoRoutes from '@/services/info/routes/routes';
import OpsFlowConfigurator from '@/services/ops-flow/configurator';
import ProjectConfigurator from '@/services/project/configurator';
import ServiceAccountConfigurator from '@/services/service-account/configurator';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';


class ServiceConfigurator {
    private config: GlobalServiceConfig = {} as GlobalServiceConfig;

    private featureSchema: FeatureSchemaType = {} as FeatureSchemaType;

    async initialize(mergedConfig) {
        this.config = mergedConfig;

        const featureSchemaManager = new FeatureSchemaManager(this.config);
        const featureSchema = await featureSchemaManager.applyGlobalConfig();

        if (isEmpty(this.config)) return;

        this.featureSchema = featureSchema;
    }

    getRoutes(mode: string): RouteConfig[] {
        const baseRoutes = mode === 'admin'
            ? [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoutes]
            : [workspaceHomeRoute, infoRoutes];

        Object.keys(this.featureSchema).forEach((serviceName) => {
            const configurator = ServiceConfigurator.getFeatureConfigurator(serviceName);
            if (configurator) {
                const version = this.featureSchema[serviceName].currentVersion;
                const route = mode === 'admin'
                    ? configurator.getAdminRoutes(version)
                    : configurator.getWorkspaceRoutes(version);
                if (route && !baseRoutes.some((existingRoute) => existingRoute.path === route.path)) {
                    baseRoutes.push(route);
                }
            }
        });

        return baseRoutes;
    }

    getMenuList(mode: string): Menu[] {
        const menuStore = useMenuStore();

        const menuList: Menu[] = mode === 'admin' ? [] : DEFAULT_MENU_LIST;

        Object.keys(this.featureSchema).forEach((serviceName) => {
            const configurator = ServiceConfigurator.getFeatureConfigurator(serviceName);
            if (configurator) {
                const feature = this.featureSchema[serviceName];
                const versionSchema = feature[feature.currentVersion];
                configurator.applyUiAffects(versionSchema);
                const serviceMenu = mode === 'admin'
                    ? configurator.getAdminMenu(versionSchema)
                    : configurator.getWorkspaceMenu(versionSchema);
                if (serviceMenu && !menuList.some((existingRoute) => existingRoute.id === serviceMenu.id)) {
                    menuList.push(serviceMenu);
                }
            }
        });

        if (mode === 'admin') {
            menuList.push(...DEFAULT_ADMIN_MENU_LIST);
        }

        menuStore.setMenuList(menuList);

        return menuList;
    }

    private static getFeatureConfigurator(featureName: string): any | null {
        const configurators = {
            DASHBOARDS: DashboardConfigurator,
            PROJECT: ProjectConfigurator,
            SERVICE_ACCOUNT: ServiceAccountConfigurator,
            ASSET_INVENTORY: AssetInventoryConfigurator,
            COST_EXPLORER: CostExplorerConfigurator,
            ALERT_MANAGER: AlertManagerConfigurator,
            OPS_FLOW: OpsFlowConfigurator,
            IAM: IamConfigurator,
        };

        return configurators[featureName] || null;
    }
}

export default new ServiceConfigurator();
