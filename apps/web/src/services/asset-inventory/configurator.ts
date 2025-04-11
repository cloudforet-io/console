import type {
    FeatureConfiguratorType, FeatureMenuConfig, FeatureRouteConfig, FeatureUiAffect,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';

class AssetInventoryConfigurator implements FeatureConfiguratorType {
    private version: 'V1' | 'V2' = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [
        {
            feature: 'ALERT_MANAGER',
            affects: [
                {
                    method: 'visibleAssetAlertTab',
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
            routes: assetInventoryRoute,
            adminRoutes: adminAssetInventoryRoutes,
            version: this.version,
        };
    }

    getMenu(): FeatureMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.ASSET_INVENTORY,
            needPermissionByRole: true,
            subMenuList: [],
            order: 4,
        };

        return {
            menu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.CLOUD_SERVICE, needPermissionByRole: true },
                    { id: MENU_ID.SERVER, needPermissionByRole: true },
                    { id: MENU_ID.SECURITY, needPermissionByRole: true },
                    { id: MENU_ID.COLLECTOR, needPermissionByRole: true },
                ],
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.CLOUD_SERVICE },
                    { id: MENU_ID.SERVER },
                    { id: MENU_ID.SECURITY },
                    { id: MENU_ID.COLLECTOR },
                ],
            },
            version: this.version,
        };
    }
}

export default new AssetInventoryConfigurator();
