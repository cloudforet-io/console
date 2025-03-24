import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';
import type { versionSchemaType } from '@/services/featureSchema';

class AssetInventoryConfigurator {
    static getAdminRoutes() {
        return adminAssetInventoryRoutes;
    }

    static getWorkspaceRoutes() {
        return assetInventoryRoute;
    }

    static getAdminMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.adminMenu || versionSchema.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.ASSET_INVENTORY,
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
            id: MENU_ID.ASSET_INVENTORY,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }
}

export default AssetInventoryConfigurator;
