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

import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';


class AlertManagerConfigurator implements FeatureConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {};

    readonly uiAffect: GeneratedUiAffectConfig[] = [
        {
            feature: 'ALERT_MANAGER',
            affects: [
                {
                    method: 'visibleAlertIcon',
                    version: 'V1',
                },
                {
                    method: 'visibleUserNotification',
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
            routes: this.version === 'V1' ? alertManagerRouteV1 : alertManagerRoute,
            adminRoutes: null,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.ALERT_MANAGER,
            needPermissionByRole: true,
            subMenuList: [],
            order: 6,
        };

        if (this.version === 'V1') {
            baseMenu.subMenuList = [
                { id: MENU_ID.ALERT_MANAGER_DASHBOARD, needPermissionByRole: true },
                { id: MENU_ID.ALERTS, needPermissionByRole: true },
                { id: MENU_ID.ESCALATION_POLICY, needPermissionByRole: true },
            ];
        } else {
            baseMenu.subMenuList = [
                { id: MENU_ID.SERVICE, needPermissionByRole: true },
                { id: MENU_ID.ALERTS, needPermissionByRole: true },
            ];
        }

        return {
            menu: baseMenu,
            adminMenu: null,
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

export default new AlertManagerConfigurator();
