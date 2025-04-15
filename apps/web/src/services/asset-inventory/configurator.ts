import type {
    FeatureConfigurator,
    FeatureRouteConfig,
    FeatureVersion,
    GeneratedMenuConfig,
    GeneratedRouteMetadata,
    GeneratedRouteMetadataConfig,
    GeneratedUiAffectConfig,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminAssetInventoryRoutes from '@/services/asset-inventory/routes/admin/routes';
import assetInventoryRoute from '@/services/asset-inventory/routes/routes';

class AssetInventoryConfigurator implements FeatureConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {};

    readonly uiAffect: GeneratedUiAffectConfig[] = [
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

    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: assetInventoryRoute,
            adminRoutes: adminAssetInventoryRoutes,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
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
                    { id: MENU_ID.METRIC_EXPLORER, needPermissionByRole: true },
                    { id: MENU_ID.COLLECTOR, needPermissionByRole: true },
                ],
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.CLOUD_SERVICE },
                    { id: MENU_ID.SERVER },
                    { id: MENU_ID.SECURITY },
                    { id: MENU_ID.METRIC_EXPLORER },
                    { id: MENU_ID.COLLECTOR },
                ],
            },
            version: this.version,
        };
    }

    getRouteMetadata(): GeneratedRouteMetadataConfig {
        const versionedMetadata: GeneratedRouteMetadataConfig = {};

        Object.entries(this.routeMetadata).forEach(([routeKey, routeConfig]) => {
            const versionConfig = routeConfig[this.version];
            if (versionConfig) {
                versionedMetadata[routeKey] = {
                    name: versionConfig.name,
                    ...(versionConfig.params && { params: versionConfig.params }),
                };
            }
        });

        return versionedMetadata;
    }
}

export default new AssetInventoryConfigurator();
