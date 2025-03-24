import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import costExplorerRoutes from '@/services/cost-explorer/routes/routes';

class CostExplorerConfigurator {
    static getAdminRoutes() {
        return adminCostExplorerRoutes;
    }

    static getWorkspaceRoutes() {
        return costExplorerRoutes;
    }

    static getAdminMenu(): Menu {
        return {
            id: MENU_ID.COST_EXPLORER,
            subMenuList: [
                { id: MENU_ID.COST_ANALYSIS },
                { id: MENU_ID.BUDGET },
                { id: MENU_ID.COST_REPORT },
                { id: MENU_ID.DATA_SOURCES },
                { id: MENU_ID.COST_ADVANCED_SETTINGS },
            ],
        };
    }

    static getWorkspaceMenu(): Menu {
        return {
            id: MENU_ID.COST_EXPLORER,
            needPermissionByRole: true,
            subMenuList: [
                { id: MENU_ID.COST_ANALYSIS, needPermissionByRole: true },
                { id: MENU_ID.BUDGET, needPermissionByRole: true },
                { id: MENU_ID.COST_REPORT, needPermissionByRole: true },
            ],
        };
    }
}

export default CostExplorerConfigurator;
