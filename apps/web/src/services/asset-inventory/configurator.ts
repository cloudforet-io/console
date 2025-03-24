import type { FeatureVersionSettingsType } from '@/lib/config/global-config/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';

class AssetInventoryConfigurator {
    static getAdminRoutes() {
        return adminAssetInventoryRoutes;
    }

    static getWorkspaceRoutes() {
        return assetInventoryRoute;
    }

    static getAdminMenu(settings: FeatureVersionSettingsType): Menu {
        const menu = settings.adminMenu || settings.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({ id: MENU_INFO_MAP[menuId].menuId }));
        return {
            id: MENU_ID.ASSET_INVENTORY,
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
            id: MENU_ID.ASSET_INVENTORY,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }
}

export default AssetInventoryConfigurator;
