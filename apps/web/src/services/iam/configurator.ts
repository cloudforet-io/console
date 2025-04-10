import type { RouteConfig } from 'vue-router';

import type { FeatureConfiguratorType, FeatureMenuConfig, FeatureUiAffect } from '@/lib/config/global-config/types/type';
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

    // eslint-disable-next-line class-methods-use-this
    getRoutes(isAdmin?: boolean): RouteConfig | null {
        return isAdmin ? adminIamRoutes : iamRoutes;
    }

    getMenu(): FeatureMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.IAM,
            needPermissionByRole: true,
            subMenuList: [],
            order: 8,
        };

        return {
            menu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.USER, needPermissionByRole: true },
                    { id: MENU_ID.USER_GROUP, needPermissionByRole: true },
                    { id: MENU_ID.APP, needPermissionByRole: true },
                ],
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.USER },
                    { id: MENU_ID.USER_GROUP },
                    { id: MENU_ID.APP },
                    { id: MENU_ID.ROLE },
                ],
            },
            version: this.version,
        };
    }
}

export default new IamConfigurator();
