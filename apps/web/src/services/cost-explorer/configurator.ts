import type {
    FeatureRouteConfig,
    FeatureVersion,
    GeneratedMenuConfig,
    GeneratedRouteMetadata,
    GeneratedUiAffectConfig,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import costExplorerRoutes from '@/services/cost-explorer/routes/routes';

class CostExplorerConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {};

    readonly uiAffect: GeneratedUiAffectConfig[] = [
        {
            feature: 'ALERT_MANAGER',
            affects: [
                {
                    method: 'visibleBudgetNotification',
                    version: 'V2',
                },
            ],
        },
    ];


    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: costExplorerRoutes,
            adminRoutes: adminCostExplorerRoutes,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.COST_EXPLORER,
            needPermissionByRole: true,
            subMenuList: [],
            order: 5,
        };

        return {
            menu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.COST_ANALYSIS, needPermissionByRole: true },
                    { id: MENU_ID.BUDGET, needPermissionByRole: true },
                    { id: MENU_ID.COST_REPORT, needPermissionByRole: true },
                ],
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.COST_ANALYSIS },
                    { id: MENU_ID.BUDGET },
                    { id: MENU_ID.COST_REPORT },
                    { id: MENU_ID.DATA_SOURCES },
                    { id: MENU_ID.COST_ADVANCED_SETTINGS },
                ],
            },
            version: this.version,
        };
    }

    getRouteMetadata(): GeneratedRouteMetadata {
        return this.routeMetadata;
    }
}

export default new CostExplorerConfigurator();
