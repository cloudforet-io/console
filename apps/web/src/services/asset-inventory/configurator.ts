import { MENU_ID } from '@/lib/menu/config';

import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';

class AssetInventoryConfigurator {
    static getAdminRoutes() {
        return adminAssetInventoryRoutes;
    }

    static getWorkspaceRoutes() {
        return assetInventoryRoute;
    }

    static getAdminMenu() {
        return {
            id: MENU_ID.ASSET_INVENTORY,
            subMenuList: [
                { id: MENU_ID.CLOUD_SERVICE },
                { id: MENU_ID.SERVER },
                { id: MENU_ID.SECURITY },
                { id: MENU_ID.METRIC_EXPLORER },
                { id: MENU_ID.COLLECTOR },
            ],
        };
    }

    static getWorkspaceMenu() {
        return {
            id: MENU_ID.ASSET_INVENTORY,
            needPermissionByRole: true,
            subMenuList: [
                { id: MENU_ID.CLOUD_SERVICE, needPermissionByRole: true },
                { id: MENU_ID.SERVER, needPermissionByRole: true },
                { id: MENU_ID.SECURITY, needPermissionByRole: true },
                { id: MENU_ID.METRIC_EXPLORER, needPermissionByRole: true },
                { id: MENU_ID.COLLECTOR, needPermissionByRole: true },
            ],
        };
    }
}

export default AssetInventoryConfigurator;
