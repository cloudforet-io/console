import type { FeatureVersionSettingsType } from '@/lib/config/global-config/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import costExplorerRoutes from '@/services/cost-explorer/routes/routes';

class CostExplorerConfigurator {
    static getAdminRoutes() {
        return adminCostExplorerRoutes;
    }

    static getWorkspaceRoutes() {
        return costExplorerRoutes;
    }

    static getAdminMenu(settings: FeatureVersionSettingsType): Menu {
        const menu = settings.adminMenu || settings.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.COST_EXPLORER,
            subMenuList: subMenuIds,
        };
    }

    static getWorkspaceMenu(settings: FeatureVersionSettingsType): Menu {
        const menu = settings.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({
                id: MENU_INFO_MAP[menuId].menuId,
                needPermissionByRole: true,
            }));
        return {
            id: MENU_ID.COST_EXPLORER,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }
}

export default CostExplorerConfigurator;
