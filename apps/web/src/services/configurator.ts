import type { RouteConfig } from 'vue-router';

import { useGlobalConfigSettingStore } from '@/store/config/global-config-setting-store';
import { useMenuStore } from '@/store/menu/menu-store';

import config from '@/lib/config';
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

interface ServiceConfig {
    ENABLED: boolean;
    VERSION: string;
}

interface GlobalConfig {
    SERVICES: {
        [key: string]: ServiceConfig;
    };
}

export interface FeatureVersions {
    DASHBOARD: string;
    PROJECT: string;
    SERVICE_ACCOUNT: string;
    ASSET_INVENTORY: string;
    COST_EXPLORER: string;
    ALERT_MANAGER: string;
    OPS_FLOW: string;
    IAM: string;
}

class ServiceConfigurator {
    private config: GlobalConfig | null = null;

    private featureVersions: FeatureVersions = {} as FeatureVersions;

    private featureConfigurators: Record<string, any> = {
        DASHBOARD: DashboardConfigurator,
        PROJECT: ProjectConfigurator,
        SERVICE_ACCOUNT: ServiceAccountConfigurator,
        ASSET_INVENTORY: AssetInventoryConfigurator,
        COST_EXPLORER: CostExplorerConfigurator,
        ALERT_MANAGER: AlertManagerConfigurator,
        OPS_FLOW: OpsFlowConfigurator,
        IAM: IamConfigurator,
    };

    async initialize() {
        const globalConfigSettingStore = useGlobalConfigSettingStore();

        await config.init();
        this.config = config.get('SERVICES') || {};

        if (!this.config) return;
        const featureVersions = {
            IAM: 'V1',
            ...Object.fromEntries(
                Object.entries(this.config).map(([key, value]) => [key, value.VERSION]),
            ),
        };
        globalConfigSettingStore.setFeatureVersion(featureVersions);
        this.featureVersions = globalConfigSettingStore.state.featureVersions;
    }

    private get allServices() {
        if (!this.config) {
            throw new Error('ServiceConfigurator is not initialized.');
        }
        return { ...this.config, IAM: { ENABLED: true, VERSION: 'V1' } };
    }

    getRoutes(mode: 'admin' | 'workspace'): RouteConfig[] {
        const baseRoutes = mode === 'admin'
            ? [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoutes]
            : [workspaceHomeRoute, infoRoutes];

        Object.entries(this.allServices).forEach(([serviceName, serviceConfig]) => {
            if (serviceConfig.ENABLED) {
                const configurator = this.featureConfigurators[serviceName];
                if (configurator) {
                    const route = mode === 'admin'
                        ? configurator.getAdminRoutes(this.featureVersions)
                        : configurator.getWorkspaceRoutes(this.featureVersions);
                    if (route && !baseRoutes.some((existingRoute) => existingRoute.path === route.path)) {
                        baseRoutes.push(route);
                    }
                }
            }
        });

        return baseRoutes;
    }

    getMenuList(mode: 'admin' | 'workspace'): Menu[] {
        const menuStore = useMenuStore();

        const menuList: Menu[] = mode === 'admin' ? [] : DEFAULT_MENU_LIST;

        Object.entries(this.allServices).forEach(([serviceName, serviceConfig]) => {
            if (serviceConfig.ENABLED) {
                const configurator = this.featureConfigurators[serviceName];
                if (configurator) {
                    const serviceMenu = mode === 'admin'
                        ? configurator.getAdminMenu(this.featureVersions)
                        : configurator.getWorkspaceMenu(this.featureVersions);
                    if (serviceMenu && !menuList.some((existingRoute) => existingRoute.id === serviceMenu.id)) {
                        menuList.push(serviceMenu);
                    }
                }
            }
        });

        if (mode === 'admin') {
            menuList.push(...DEFAULT_ADMIN_MENU_LIST);
        }

        menuStore.setMenuList(menuList);

        return menuList;
    }
}

export default new ServiceConfigurator();
