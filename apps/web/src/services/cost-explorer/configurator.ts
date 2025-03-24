import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminCostExplorerRoutes from '@/services/cost-explorer/routes/admin/routes';
import costExplorerRoutes from '@/services/cost-explorer/routes/routes';
import type { versionSchemaType } from '@/services/featureSchema';

class CostExplorerConfigurator {
    static getAdminRoutes() {
        return adminCostExplorerRoutes;
    }

    static getWorkspaceRoutes() {
        return costExplorerRoutes;
    }

    static getAdminMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.adminMenu || versionSchema.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.COST_EXPLORER,
            subMenuList: subMenuIds,
        };
    }

    static getWorkspaceMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.menu;
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
