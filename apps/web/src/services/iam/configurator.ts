import type {
    FeatureConfiguratorType, FeatureMenuConfig, FeatureRouteConfig, FeatureUiAffect,
    GlobalServiceConfig,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminIamRoutes from '@/services/iam/routes/admin/routes';
import iamRoutes from '@/services/iam/routes/routes';

class IamConfigurator implements FeatureConfiguratorType {
    private version: 'V1' | 'V2' = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [];

    initialize(version: 'V1' | 'V2'): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: iamRoutes,
            adminRoutes: adminIamRoutes,
            version: this.version,
        };
    }

    getMenu(config?: GlobalServiceConfig): FeatureMenuConfig {
        const alertManagerVersion = config?.ALERT_MANAGER?.VERSION;
        const baseMenu: Menu = {
            id: MENU_ID.IAM,
            needPermissionByRole: true,
            subMenuList: [],
            order: 8,
        };

        const workspaceSubMenuList: Menu[] = [
            { id: MENU_ID.USER, needPermissionByRole: true },
            { id: MENU_ID.APP, needPermissionByRole: true },
        ];

        const adminSubMenuList: Menu[] = [
            { id: MENU_ID.USER },
            { id: MENU_ID.APP },
            { id: MENU_ID.ROLE },
        ];

        if (alertManagerVersion === 'V2') {
            workspaceSubMenuList.splice(1, 0, { id: MENU_ID.USER_GROUP, needPermissionByRole: true });
            adminSubMenuList.splice(1, 0, { id: MENU_ID.USER_GROUP });
        }

        return {
            menu: {
                ...baseMenu,
                subMenuList: workspaceSubMenuList,
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: adminSubMenuList,
            },
            version: this.version,
        };
    }
}

export default new IamConfigurator();
