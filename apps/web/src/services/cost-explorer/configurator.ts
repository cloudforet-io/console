import type {
    FeatureConfiguratorType, FeatureMenuConfig, FeatureRouteConfig, FeatureUiAffect,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import costExplorerRoutes from '@/services/cost-explorer/routes/routes';

class CostExplorerConfigurator implements FeatureConfiguratorType {
    private version: 'V1' | 'V2' = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [
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

    initialize(version: 'V1' | 'V2'): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: costExplorerRoutes,
            adminRoutes: adminCostExplorerRoutes,
            version: this.version,
        };
    }

    getMenu(): FeatureMenuConfig {
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
                    { id: MENU_ID.COST_ADVANCED_SETTINGS },
                    { id: MENU_ID.BUDGET },
                    { id: MENU_ID.COST_REPORT },
                    { id: MENU_ID.DATA_SOURCES },
                ],
            },
            version: this.version,
        };
    }
}

export default new CostExplorerConfigurator();
